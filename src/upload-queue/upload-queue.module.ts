import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';

import { UploadQueueService } from './upload-queue.service';
import { UploadProcessor } from './upload.processor';

import { Exercise, ExerciseSchema } from '../exercises/schemas/exercise.schema';
import { UploadService } from 'src/common/storage/upload.service';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'image-upload',
    }),

    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
    ]),
    StorageModule,
  ],
  providers: [UploadQueueService, UploadProcessor],
  exports: [UploadQueueService],
})
export class UploadQueueModule {}