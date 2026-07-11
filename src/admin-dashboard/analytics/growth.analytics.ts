import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from 'src/users/schema/users.schema';

import {
  Subscription,
  SubscriptionDocument,
} from 'src/user-subscription/schema/user-subscription.schema';

@Injectable()
export class GrowthAnalytics {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async getGrowth() {
    const [usersGrowth, subscriptionsGrowth] = await Promise.all([
      this.getUsersGrowth(),
      this.getSubscriptionsGrowth(),
    ]);

    return {
      usersGrowth,
      subscriptionsGrowth,
    };
  }

  private async getUsersGrowth() {
    return this.userModel.aggregate([
      {
        $match: {
          createdAt: {
            $exists: true,
            $ne: null,
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: '$createdAt',
            },
            month: {
              $month: '$createdAt',
            },
          },

          users: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },

      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          users: 1,
        },
      },
    ]);
  }

  private async getSubscriptionsGrowth() {
    return this.subscriptionModel.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: '$createdAt',
            },

            month: {
              $month: '$createdAt',
            },
          },

          subscriptions: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },

      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          subscriptions: 1,
        },
      },
    ]);
  }
}
