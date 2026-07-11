import { Injectable } from '@nestjs/common';
import { UsersAnalytics } from './analytics/users.analytics';
import { SubscriptionAnalytics } from './analytics/subscriptions.analytics';
import { SubscriptionPlansAnalytics } from './analytics/subscription-plans.analytics';
import { RevenueAnalytics } from './analytics/revenue.analytics';
import { GrowthAnalytics } from './analytics/growth.analytics';
import { ActivityAnalytics } from './analytics/activity.analytics';


@Injectable()
export class AdminDashboardService {


  constructor(
    private readonly usersAnalytics: UsersAnalytics,
    private readonly subscriptionAnalytics: SubscriptionAnalytics,
    private readonly subscriptionPlansAnalytics: SubscriptionPlansAnalytics,
    private readonly revenueAnalytics: RevenueAnalytics,
     private readonly growthAnalytics: GrowthAnalytics,
      private readonly activityAnalytics: ActivityAnalytics
  ){}



  async getOverview(){

    const users =await this.usersAnalytics.getOverview();

    const subscriptions =await this.subscriptionAnalytics.getOverview();

    const subscriptionPlans =await this.subscriptionPlansAnalytics.getOverview();
    const revenue =await this.revenueAnalytics.getOverview();
    return {

      users,
      revenue,
      subscriptions,
      subscriptionPlans,
    

    };

  }

  // Get growth analytics
async getGrowth(){

  return this.growthAnalytics.getGrowth();

}

async getActivity(){

 return this.activityAnalytics
   .getActivityAnalytics();

}

}