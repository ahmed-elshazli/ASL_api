import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';

import { UploadQueueService } from './upload-queue.service';
import { UploadProcessor } from './upload.processor';

import { Exercise, ExerciseSchema } from '../exercises/schemas/exercise.schema';
import { UploadService } from 'src/common/storage/upload.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'image-upload',
    }),

    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
    ]),
  ],
  providers: [UploadQueueService, UploadProcessor,UploadService],
  exports: [UploadQueueService],
})
export class UploadQueueModule {}