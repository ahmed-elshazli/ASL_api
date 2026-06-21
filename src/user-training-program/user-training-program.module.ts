import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserTrainingProgram,
  UserTrainingProgramSchema,
} from './schemas/user-training-program.schema';
import { UserTrainingProgramService } from './user-training-program.service';
import { UserTrainingProgramController } from './user-training-program.controller';
import { TrainingProgram, TrainingProgramSchema } from '../training-program/schemas/training-program.schema';
import { User, UserSchema } from 'src/users/schema/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserTrainingProgram.name, schema: UserTrainingProgramSchema },
      { name: User.name, schema: UserSchema },
      { name: TrainingProgram.name, schema: TrainingProgramSchema},
    ]),
  ],
  controllers: [UserTrainingProgramController],
  providers: [UserTrainingProgramService],
})
export class UserTrainingProgramModule {}