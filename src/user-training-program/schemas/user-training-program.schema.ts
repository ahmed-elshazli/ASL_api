import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CompletedExercise, CompletedExerciseSchema } from './completed-exercise.schema';

export type UserTrainingProgramDocument = HydratedDocument<UserTrainingProgram>;

export enum UserProgramStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class UserTrainingProgram {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'TrainingProgram',
    required: true,
  })
  programId: Types.ObjectId;

  @Prop({
    type: String,
    enum: UserProgramStatus,
    default: UserProgramStatus.ACTIVE,
    index: true,
  })
  status: UserProgramStatus;

  @Prop({
    required: true,
    min: 1,
  })
  totalExercises: number;

  @Prop({
    type: [CompletedExerciseSchema],
    default: [],
  })
  completedExercises: CompletedExercise[];

  @Prop({
    default: 0,
    min: 0,
    max: 100,
  })
  progress: number;

 

  @Prop({
    
    min: 1,
  })
  durationInDays: number; 

  @Prop({
    required: true,
    min: 1,
    default: 1,
  })
  repeatCount: number; 

  @Prop({
    default: 0,
    min: 0,
  })
  currentRound: number; 

  @Prop({
   
  })
  endDate: Date; // startedAt + durationInDays 

 

  @Prop({
    type: Date,
  })
  completedAt?: Date;

  @Prop({
    type: Date,
    default: () => new Date(),
  })
  startedAt: Date;
}

export const UserTrainingProgramSchema = SchemaFactory.createForClass(UserTrainingProgram);

UserTrainingProgramSchema.index({ userId: 1, status: 1 });
UserTrainingProgramSchema.index({ userId: 1, programId: 1 });
UserTrainingProgramSchema.index({ endDate: 1, status: 1 }); //cron job 