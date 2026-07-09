import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
import { Type } from 'class-transformer';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,

    @InjectModel(SubscriptionPlan.name)
    private readonly subscriptionPlanModel: Model<SubscriptionPlanDocument>,
  ) {}

  async createSubscription(doctorId: string, dto: CreateSubscriptionDto) {


    const plan = await this.subscriptionPlanModel.findById(dto.planId);

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }
    const activeSubscription = await this.subscriptionModel.findOne({
      user: dto.userId,
      status: SubscriptionStatus.ACTIVE,
    });
    if (activeSubscription) {
      throw new ConflictException('User already has an active subscription.');
    }

  

    const startDate = new Date();

    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + plan.durationInDays);

    const subscription = await this.subscriptionModel.create({
      user: dto.userId,
      plan: plan._id,
      startDate,
      endDate,
      approvedBy: doctorId,
      status: SubscriptionStatus.ACTIVE,
    });

    return subscription.populate('plan');
  }


  async getCurrentSubscription(userId: string) {
  const subscription = await this.subscriptionModel
    .findOne({
      user: userId.toString(),
      status: SubscriptionStatus.ACTIVE,
    })
    .populate('plan')
    .populate('approvedBy', 'fullName role').lean();

  if (!subscription) {
    throw new NotFoundException('No active subscription found.');
  }

  return subscription;
}


async getSubscriptionHistory(userId: string) {
  return this.subscriptionModel
    .find({
      user: userId.toString(),
    })
    .populate('plan')
    .populate('approvedBy', 'fullName role')
    .sort({
      createdAt: -1,
    }).lean();
}


async getAllSubscriptions(query:BuildQueryDto) {
const baseQuery= this.subscriptionModel
    .find()
    .populate('user', 'fullName email phone')
    .populate('plan','name price durationInDays ')
    .populate('approvedBy', 'fullName role').lean()

     const features = new ApiFeatures(baseQuery, query)
          .filter()
          
    
      
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
  const subscription =
    await this.subscriptionModel.findById(subscriptionId);

  if (!subscription) {
    throw new NotFoundException('Subscription not found.');
  }

  subscription.status = SubscriptionStatus.CANCELLED;

  await subscription.save();

  return subscription;
}

async expireSubscriptions() {
  const result =
    await this.subscriptionModel.updateMany(
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
}
