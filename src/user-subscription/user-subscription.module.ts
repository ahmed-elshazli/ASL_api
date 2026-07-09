import { Module } from '@nestjs/common';
import { SubscriptionService } from './user-subscription.service';
import { SubscriptionController } from './user-subscription.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import {
 Subscription,
  SubscriptionSchema,
} from './schema/user-subscription.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from 'src/subscription-plan/schema/subscription-plan.schema';
import { SubscriptionCron } from './cron/subscription.cron';

@Module({
  imports: [
     ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlanSchema,
      },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService,SubscriptionCron],
  exports: [SubscriptionService],
})
export class UserSubscriptionModule {}
