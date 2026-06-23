import { Module } from '@nestjs/common';
import { PatientDashboardService } from './patient-dashboard.service';
import { PatientDashboardController } from './patient-dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schema/users.schema';
import { WeightLog, WeightLogSchema } from 'src/weight-log/schemas/weight-log.schema';
import { UserTrainingProgram, UserTrainingProgramSchema } from 'src/user-training-program/schemas/user-training-program.schema';
import { Exercise, ExerciseSchema } from 'src/exercises/schemas/exercise.schema';
import { WeightLogModule } from 'src/weight-log/weight-log.module';

@Module({

    imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: WeightLog.name, schema: WeightLogSchema },
      { name: UserTrainingProgram.name, schema: UserTrainingProgramSchema },
      { name: Exercise.name, schema: ExerciseSchema },
    ]),
     WeightLogModule, 
  ],
  controllers: [PatientDashboardController],
  providers: [PatientDashboardService],
})
export class PatientDashboardModule {}
