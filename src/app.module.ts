import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';

import { StorageModule } from './common/storage/storage.module';


import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { PlansModule } from './plans/plans.module';
import { ExercisesModule } from './exercises/exercises.module';
import { TrainingProgramModule } from './training-program/training-program.module';
import { UserTrainingProgramModule } from './user-training-program/user-training-program.module';
import { UploadQueueModule } from './upload-queue/upload-queue.module';
import { BullModule } from '@nestjs/bullmq';
import { WeightLogModule } from './weight-log/weight-log.module';
import { PatientDashboardModule } from './patient-dashboard/patient-dashboard.module';

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

    CacheModule.register({
      ttl: 60,
      isGlobal: true,
    }),

  BullModule.forRoot({
  connection: {
    host: 'localhost',
    port: 6379,
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
  
  
 
 
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
