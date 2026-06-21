import { Module } from '@nestjs/common';
import { TrainingProgramService } from './training-program.service';
import { TrainingProgramController } from './training-program.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingProgram, TrainingProgramSchema } from './schemas/training-program.schema';

@Module({

    imports: [
    MongooseModule.forFeature([
      {
        name: TrainingProgram.name,
        schema: TrainingProgramSchema,
      },
    ]),
  ],
  controllers: [TrainingProgramController],
  providers: [TrainingProgramService],
})
export class TrainingProgramModule {}
