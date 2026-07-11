import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Subscription,
  SubscriptionDocument,
} from 'src/user-subscription/schema/user-subscription.schema';

import { SubscriptionStatus } from 'src/user-subscription/enums/subscription-status.enum';


@Injectable()
export class SubscriptionAnalytics {

  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel:
    Model<SubscriptionDocument>,
  ) {}


  async getOverview() {


    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );


    const nextWeek = new Date();

    nextWeek.setDate(
      nextWeek.getDate() + 7
    );


    const [
      total,
      active,
      expired,
      cancelled,
      newThisMonth,
      expiringSoon,
    ] = await Promise.all([


      this.subscriptionModel.countDocuments(),


      this.subscriptionModel.countDocuments({
        status: SubscriptionStatus.ACTIVE,
      }),


      this.subscriptionModel.countDocuments({
        status: SubscriptionStatus.EXPIRED,
      }),


      this.subscriptionModel.countDocuments({
        status: SubscriptionStatus.CANCELLED,
      }),


      this.subscriptionModel.countDocuments({
        createdAt:{
          $gte:startOfMonth,
        },
      }),


      this.subscriptionModel.countDocuments({

        status: SubscriptionStatus.ACTIVE,

        endDate:{
          $gte:new Date(),
          $lte:nextWeek,
        },

      }),


    ]);


    return {

      total,

      active,

      expired,

      cancelled,

      newThisMonth,

      expiringSoon,

    };


  }

}