import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from 'src/subscription-plan/schema/subscription-plan.schema';


@Injectable()
export class SubscriptionPlansAnalytics {

  constructor(
    @InjectModel(SubscriptionPlan.name)
    private readonly planModel:
      Model<SubscriptionPlanDocument>,
  ) {}


  async getOverview() {

    const [
      total,
      active,
      popularPlan,
    ] = await Promise.all([


      this.planModel.countDocuments(),


      this.planModel.countDocuments({
        isActive:true,
      }),


      this.planModel.findOne({
        isPopular:true,
      })
      .select('name')
      .lean(),


    ]);


    return {

      total,

      active,

      inactive: total - active,

      popularPlan:
        popularPlan?.name ?? null,

    };

  }

}