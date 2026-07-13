import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Subscription,
  SubscriptionDocument,
} from './schema/user-subscription.schema';

import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from 'src/subscription-plan/schema/subscription-plan.schema';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { CreateSubscriptionDto } from './dto/create-user-subscription.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ApiFeatures } from 'src/common/utils/api-features';
import { RejectSubscriptionDto } from './dto/reject-subscription.dto';
import { CreateSubscriptionByDoctorDto } from './dto/create-subscription-by-doctor.dto';
import { UploadService } from 'src/common/storage/upload.service';
import {
  PaymentMethod,
  PaymentMethodDocument,
} from 'src/payment-methods/schemas/payment-method.schema';

const PAYMENT_METHOD_FIELDS = 'name type accountName accountNumber instructions';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,

    @InjectModel(SubscriptionPlan.name)
    private readonly subscriptionPlanModel: Model<SubscriptionPlanDocument>,

    @InjectModel(PaymentMethod.name)
    private readonly paymentMethodModel: Model<PaymentMethodDocument>,

    private readonly uploadService: UploadService,
  ) {}

  /**
   * Resolves paymentMethod refs manually instead of via .populate(), because
   * some legacy subscriptions have a non-ObjectId value in that field —
   * letting Mongoose cast it during populate throws and fails the whole
   * query. Invalid/unknown refs just resolve to null instead of crashing.
   */
  private async resolvePaymentMethods(
    rawIds: unknown[],
  ): Promise<Map<string, any>> {
    const validIds = [
      ...new Set(
        rawIds
          .filter((id): id is string | Types.ObjectId => !!id)
          .map((id) => id.toString())
          .filter((id) => Types.ObjectId.isValid(id)),
      ),
    ];

    if (!validIds.length) return new Map();

    const methods = await this.paymentMethodModel
      .find({ _id: { $in: validIds } })
      .select(PAYMENT_METHOD_FIELDS)
      .lean();

    return new Map(methods.map((m) => [m._id.toString(), m]));
  }

  async createSubscription(dto: CreateSubscriptionDto, userId: string, file: Express.Multer.File,) {
    const plan = await this.subscriptionPlanModel.findById(dto.planId);

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    const existingSubscription = await this.subscriptionModel.findOne({
      user: userId,
      status: {
        $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
      },
    });

    if (existingSubscription) {
      throw new ConflictException(
        'User already has an active or pending subscription.',
      );
    }

    const paymentScreenshot = await this.uploadService.uploadSingle(file);

    const subscription = await this.subscriptionModel.create({
      user: userId,
      plan: plan._id,
      paymentMethod: dto.paymentMethodId,
      senderNumber: dto.senderNumber,
      paymentScreenshot,
      status: SubscriptionStatus.PENDING,
    });

    return subscription.populate([
      { path: 'plan' },
      { path: 'paymentMethod', select: 'name type accountName accountNumber instructions' },
    ]);
  }

  async createSubscriptionByDoctor(
    doctorId: string,
    dto: CreateSubscriptionByDoctorDto,
  ) {
    const plan = await this.subscriptionPlanModel.findById(dto.planId);

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    const existingSubscription = await this.subscriptionModel.findOne({
      user: dto.userId,
      status: {
        $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
      },
    });

    if (existingSubscription) {
      throw new ConflictException(
        'User already has an active or pending subscription.',
      );
    }

    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, plan.durationInDays);

    const subscription = await this.subscriptionModel.create({
      user: dto.userId,
      plan: plan._id,
      startDate,
      endDate,
      approvedBy: doctorId,
      reviewedAt: new Date(),
      status: SubscriptionStatus.ACTIVE,
    });

    return subscription.populate('plan');
  }
  //

  async rejectSubscription(doctorId: string, dto: RejectSubscriptionDto) {
    const subscription = await this.subscriptionModel.findById(
      dto.subscriptionId,
    );

    if (!subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    if (subscription.status !== SubscriptionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending subscriptions can be rejected.',
      );
    }

    subscription.status = SubscriptionStatus.REJECTED;
    subscription.approvedBy = new Types.ObjectId(doctorId);
    subscription.reviewedAt = new Date();
    subscription.rejectReason = dto.rejectReason;

    await subscription.save();

    return subscription;
  }

  async getCurrentSubscription(userId: string) {
    const subscription: any = await this.subscriptionModel
      .findOne({
        user: userId.toString(),
      })
      .sort({ createdAt: -1 })
      .populate('plan')
      .populate('approvedBy', 'fullName role')
      .lean();

    if (!subscription) {
      throw new NotFoundException('No active subscription found.');
    }

    const methodMap = await this.resolvePaymentMethods([subscription.paymentMethod]);
    subscription.paymentMethod = subscription.paymentMethod
      ? (methodMap.get(subscription.paymentMethod.toString()) ?? null)
      : subscription.paymentMethod;

    return subscription;
  }

  async getPendingSubscriptions(query:BuildQueryDto) {
  const baseQuery = this.subscriptionModel
      .find({ status: SubscriptionStatus.PENDING })
      .populate('user', 'fullName email phone')
      .populate('plan', 'name price durationInDays')
      .lean();

    const features = new ApiFeatures(baseQuery, query).filter();

    const total = await features.count();

    features.sort().limitFields().paginate(total);

    const data: any[] = await features.exec();

    const methodMap = await this.resolvePaymentMethods(data.map((d) => d.paymentMethod));
    data.forEach((d) => {
      d.paymentMethod = d.paymentMethod ? (methodMap.get(d.paymentMethod.toString()) ?? null) : d.paymentMethod;
    });

    return {
      results: data.length,
      pagination: features.paginationResult,
      data,
    };
  }

  async getAllSubscriptions(query: BuildQueryDto) {
    const baseQuery = this.subscriptionModel
      .find()
      .populate('user', 'fullName email phone')
      .populate('plan', 'name price durationInDays ')
      .populate('approvedBy', 'fullName role')
      .lean();

    const features = new ApiFeatures(baseQuery, query).filter();

    const total = await features.count();

    features.sort().limitFields().paginate(total);

    const data: any[] = await features.exec();

    const methodMap = await this.resolvePaymentMethods(data.map((d) => d.paymentMethod));
    data.forEach((d) => {
      d.paymentMethod = d.paymentMethod ? (methodMap.get(d.paymentMethod.toString()) ?? null) : d.paymentMethod;
    });

    return {
      results: data.length,
      pagination: features.paginationResult,
      data,
    };
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.subscriptionModel.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        'Only active subscriptions can be cancelled.',
      );
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    await subscription.save();

    return subscription;
  }

  async cancelMySubscription(userId: string) {
    const subscription = await this.subscriptionModel.findOne({
      user: userId.toString(),
      status: SubscriptionStatus.ACTIVE,
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription to cancel.');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    await subscription.save();

    return subscription;
  }

  async expireSubscriptions() {
    const result = await this.subscriptionModel.updateMany(
      {
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          $lte: new Date(),
        },
      },
      {
        $set: {
          status: SubscriptionStatus.EXPIRED,
        },
      },
    );

    return result.modifiedCount;
  }

  async approveSubscription(subscriptionId: string, doctorId: string) {
  const subscription = await this.subscriptionModel.findById(subscriptionId);

  if (!subscription) {
    throw new NotFoundException('Subscription not found.');
  }

  if (subscription.status !== SubscriptionStatus.PENDING) {
    throw new BadRequestException(
      'Only pending subscriptions can be approved.',
    );
  }

  const plan = await this.subscriptionPlanModel.findById(subscription.plan);

  if (!plan) {
    throw new NotFoundException('Subscription plan not found.');
  }

  const startDate = new Date();
  const endDate = this.calculateEndDate(startDate, plan.durationInDays);

  subscription.status = SubscriptionStatus.ACTIVE;
  subscription.startDate = startDate;
  subscription.endDate = endDate;
  subscription.approvedBy = new Types.ObjectId(doctorId);
  subscription.reviewedAt = new Date();

  await subscription.save();

  return subscription.populate('plan');
}

  private calculateEndDate(startDate: Date, durationInDays: number): Date {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationInDays);
    return endDate;
  }
}
