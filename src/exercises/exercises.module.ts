import { Module } from '@nestjs/common';
import { ExerciseService} from './exercises.service';
import { ExerciseController } from './exercises.controller';
import { Exercise, ExerciseSchema } from './schemas/exercise.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from 'src/common/storage/upload.service';
import { UploadQueueModule } from 'src/upload-queue/upload-queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Exercise.name, schema: ExerciseSchema }]),
     UploadQueueModule, 
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService,UploadService],
})
export class ExercisesModule {}
