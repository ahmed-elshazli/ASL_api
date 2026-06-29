import { Module } from '@nestjs/common';
import { UserSubscriptionService } from './user-subscription.service';
import { UserSubscriptionController } from './user-subscription.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSubscription, UserSubscriptionSchema } from './schema/user-subscription.schema';
import { SubscriptionPlan, SubscriptionPlanSchema } from 'src/subscription-plan/schema/subscription-plan.schema';

@Module({

    imports: [
    MongooseModule.forFeature([
      {
        name: UserSubscription.name,
        schema: UserSubscriptionSchema,
      },
      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlanSchema,
      },
    ]),
  ],
  controllers: [UserSubscriptionController],
  providers: [UserSubscriptionService],
  exports: [UserSubscriptionService],
})
export class UserSubscriptionModule {}
