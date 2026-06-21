import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type UserTrainingProgramDocument = HydratedDocument<UserTrainingProgram>;

@Schema({ timestamps: true, versionKey: false })
export class UserTrainingProgram {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: true })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'TrainingProgram',
    index: true,
    required: true,
  })
  programId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  
  // progress system
  @Prop({ default: 0, min: 0, max: 100 })
  progress: number;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ default: 0 })
  completedSessions: number;

  @Prop({ default: 0 })
  totalSessions: number;

  @Prop()
  lastUpdatedAt: Date;

  @Prop({ type: Date, default: () => new Date() })
  assignedAt: Date;
}

export const UserTrainingProgramSchema = SchemaFactory.createForClass(UserTrainingProgram);

// Prevent duplicates
UserTrainingProgramSchema.index({ userId: 1, programId: 1 }, { unique: true });
