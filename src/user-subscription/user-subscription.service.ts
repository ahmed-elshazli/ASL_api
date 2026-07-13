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

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,

    @InjectModel(SubscriptionPlan.name)
    private readonly subscriptionPlanModel: Model<SubscriptionPlanDocument>,

    private readonly uploadService: UploadService,
  ) {}

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
    const subscription = await this.subscriptionModel
      .findOne({
        user: userId.toString(),
      })
      .sort({ createdAt: -1 })
      .populate('plan')
      .populate('paymentMethod', 'name type accountName accountNumber instructions')
      .populate('approvedBy', 'fullName role')
      .lean();

    if (!subscription) {
      throw new NotFoundException('No active subscription found.');
    }

    return subscription;
  }

  async getPendingSubscriptions(query:BuildQueryDto) {
  const baseQuery = this.subscriptionModel
      .find({ status: SubscriptionStatus.PENDING })
      .populate('user', 'fullName email phone')
      .populate('plan', 'name price durationInDays')
      .populate('paymentMethod', 'name type accountName accountNumber instructions')
      .lean();

    const features = new ApiFeatures(baseQuery, query).filter();

    const total = await features.count();

    features.sort().limitFields().paginate(total);

    const data = await features.exec();

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
      .populate('paymentMethod', 'name type accountName accountNumber instructions')
      .populate('approvedBy', 'fullName role')
      .lean();

    const features = new ApiFeatures(baseQuery, query).filter();

    const total = await features.count();

    features.sort().limitFields().paginate(total);

    const data = await features.exec();

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
