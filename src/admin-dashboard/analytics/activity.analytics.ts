import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from 'src/users/schema/users.schema';
import {
  Subscription,
  SubscriptionDocument,
} from 'src/user-subscription/schema/user-subscription.schema';
import { WebsiteReview, WebsiteReviewDocument } from 'src/review/schema/review.schema';
import { WeightLog, WeightLogDocument } from 'src/weight-log/schemas/weight-log.schema';




@Injectable()
export class ActivityAnalytics {


  constructor(

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,


    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,


    @InjectModel(WebsiteReview.name)
    private readonly reviewModel: Model<WebsiteReviewDocument>,


    @InjectModel(WeightLog.name)
    private readonly weightLogModel: Model<WeightLogDocument>,

  ) {}



  async getActivityAnalytics() {


    const [
      recentUsers,
      recentSubscriptions,
      recentReviews,
      recentWeightLogs,
    ] = await Promise.all([

      this.getRecentUsers(),

      this.getRecentSubscriptions(),

      this.getRecentReviews(),

      this.getRecentWeightLogs(),

    ]);



    const activities = [

      ...recentUsers,

      ...recentSubscriptions,

      ...recentReviews,

      ...recentWeightLogs,

    ]
    .sort(
      (a,b)=>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0,10);



    return {
      activities,
    };

  }






  private async getRecentUsers(){


    const users = await this.userModel
      .find()
      .select('fullName createdAt role')
      .sort({
        createdAt:-1,
      })
      .limit(10)
      .lean();



    return users.map(user=>({

      type:'USER_REGISTERED',

      title:'New user registered',

      user:{
        id:user._id,
        name:user.fullName,
        role:user.role,
      },

      createdAt:user.createdAt,

    }));

  }







  private async getRecentSubscriptions(){


    const subscriptions = await this.subscriptionModel
      .find()
      .populate('user','fullName')
      .populate('plan','name')
      .select('user plan createdAt')
      .sort({
        createdAt:-1,
      })
      .limit(10)
      .lean();



    return subscriptions.map(subscription=>({

      type:'SUBSCRIPTION_CREATED',

      title:'New subscription created',

      user:subscription.user,

      plan:subscription.plan,

      createdAt:subscription.createdAt,

    }));

  }







  private async getRecentReviews(){


    const reviews = await this.reviewModel
      .find()
      .populate('user','fullName')
      .select('user rating createdAt')
      .sort({
        createdAt:-1,
      })
      .limit(10)
      .lean();



    return reviews.map(review=>({

      type:'REVIEW_ADDED',

      title:'New review added',

      user:review.user,

      rating:review.rating,

      createdAt:review.createdAt,

    }));

  }







  private async getRecentWeightLogs(){


    const logs = await this.weightLogModel
      .find()
      .populate('userId','fullName')
      .select('userId weight createdAt')
      .sort({
        createdAt:-1,
      })
      .limit(10)
      .lean();



    return logs.map(log=>({

      type:'WEIGHT_UPDATED',

      title:'Weight updated',

      user:log.userId,

      weight:log.weight,

      createdAt:log.createdAt,

    }));

  }


}