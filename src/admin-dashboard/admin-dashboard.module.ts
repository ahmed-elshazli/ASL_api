import { Module } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { UserModule } from 'src/users/users.module';
import { UsersAnalytics } from './analytics/users.analytics';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schema/users.schema';
import { Exercise, ExerciseSchema } from 'src/exercises/schemas/exercise.schema';
import { UserTrainingProgram, UserTrainingProgramSchema } from 'src/user-training-program/schemas/user-training-program.schema';
import { WeightLog, WeightLogSchema } from 'src/weight-log/schemas/weight-log.schema';
import { Subscription, SubscriptionSchema } from 'src/user-subscription/schema/user-subscription.schema';
import { SubscriptionAnalytics } from './analytics/subscriptions.analytics';
import { SubscriptionPlansAnalytics } from './analytics/subscription-plans.analytics';
import { SubscriptionPlan, SubscriptionPlanSchema } from 'src/subscription-plan/schema/subscription-plan.schema';
import { RevenueAnalytics } from './analytics/revenue.analytics';
import { GrowthAnalytics } from './analytics/growth.analytics';
import { ActivityAnalytics } from './analytics/activity.analytics';
import { WebsiteReview, WebsiteReviewSchema } from 'src/review/schema/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: WeightLog.name, schema: WeightLogSchema },
      { name: UserTrainingProgram.name, schema: UserTrainingProgramSchema },
      { name: Exercise.name, schema: ExerciseSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: WebsiteReview.name, schema: WebsiteReviewSchema },
    ]),


  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, UsersAnalytics, SubscriptionAnalytics, SubscriptionPlansAnalytics, 
    RevenueAnalytics, GrowthAnalytics,ActivityAnalytics],
  exports: [AdminDashboardService, UsersAnalytics, SubscriptionAnalytics]
})
export class AdminDashboardModule { }
