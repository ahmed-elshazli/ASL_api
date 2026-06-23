import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  WeightLog,
  WeightLogSchema,
} from './schemas/weight-log.schema';

import { WeightLogService } from './weight-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WeightLog.name,
        schema: WeightLogSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [WeightLogService],
  exports: [WeightLogService],
})
export class WeightLogModule {}