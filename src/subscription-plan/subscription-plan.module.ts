import { Module } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { SubscriptionPlan, SubscriptionPlanSchema } from './schema/subscription-plan.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:SubscriptionPlan.name,
        schema:SubscriptionPlanSchema

      },
    ]),
  ],
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
