import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  UserSubscription,
  UserSubscriptionDocument,
  SubscriptionStatus,
} from './schema/user-subscription.schema';

import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from 'src/subscription-plan/schema/subscription-plan.schema';

import { PaymobService } from 'src/paymob/paymob.service';

@Injectable()
export class UserSubscriptionService {
  constructor(
    @InjectModel(UserSubscription.name)
    private readonly subscriptionModel: Model<UserSubscriptionDocument>,

    @InjectModel(SubscriptionPlan.name)
    private readonly planModel: Model<SubscriptionPlanDocument>,

    private readonly paymobService: PaymobService,
  ) {}


  async checkout(
  user: any,
  planId: string,
) {
  // 1) Check if plan exists
  const plan = await this.planModel.findById(planId);

  if (!plan) {
    throw new NotFoundException('Subscription plan not found');
  }

  // 2) Check active subscription
  const activeSubscription =
    await this.subscriptionModel.findOne({
      userId: user._id,
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        $gt: new Date(),
      },
    });

  if (activeSubscription) {
    throw new ConflictException(
      'You already have an active subscription',
    );
  }

  // 3) Create payment
const payment = await this.paymobService.checkout(plan, user);

  // 4) Save pending subscription
  await this.subscriptionModel.create({
    userId: user._id,

    planId: plan._id,

    amount: plan.price,

    currency: plan.currency,

    paymentGateway: 'paymob',

    paymentReference:
      payment.reference,

    status: SubscriptionStatus.PENDING,
  });

  // 5) Return payment url
  return {
    paymentUrl: payment.paymentUrl,
  };
}
}