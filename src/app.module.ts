import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';

import { StorageModule } from './common/storage/storage.module';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PlansModule } from './plans/plans.module';
import { ExercisesModule } from './exercises/exercises.module';
import { TrainingProgramModule } from './training-program/training-program.module';
import { UserTrainingProgramModule } from './user-training-program/user-training-program.module';
import { UploadQueueModule } from './upload-queue/upload-queue.module';
import { BullModule } from '@nestjs/bullmq';
import { WeightLogModule } from './weight-log/weight-log.module';
import { PatientDashboardModule } from './patient-dashboard/patient-dashboard.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './gateway/chat.module';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module';
import { UserSubscriptionModule } from './user-subscription/user-subscription.module';
import { PaymobModule } from './paymob/paymob.module';
import { ReviewsModule } from './review/review.module';
import { AboutUsModule } from './about-us/about-us.module';
import { MailModule } from './mail/mail.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { ResultsModule } from './results/results.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.getOrThrow<number>('rateLimit.ttl'),
            limit: config.getOrThrow<number>('rateLimit.limit'),
          },
        ],
      }),
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('database.uri'),
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          connection: {
            url: config.getOrThrow<string>('REDIS_URL'),
          },
        };
      },
    }),

    AuthModule,
    UserModule,

    StorageModule,

    PlansModule,

    ExercisesModule,

    TrainingProgramModule,

    UserTrainingProgramModule,

    UploadQueueModule,

    WeightLogModule,

    PatientDashboardModule,

    ConversationsModule,

    MessagesModule,
    ChatModule,
    SubscriptionPlanModule,
    UserSubscriptionModule,
    PaymobModule,
    ReviewsModule,
    AboutUsModule,
    MailModule,
    PaymentMethodsModule,
    ResultsModule,
    AdminDashboardModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
