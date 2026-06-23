import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TrainingProgram } from 'src/training-program/schemas/training-program.schema';

export type ExerciseDocument = HydratedDocument<Exercise>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Exercise {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  })
  title: string;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  description?: string;

  @Prop({
    required: true,
    min: 1,
  })
  duration: number;

  @Prop({
    required: true,
    min: 0,
  })
  calories: number;

  @Prop({ default: 'pending' })
  uploadStatus: string;

  @Prop({ type: [String] })
  images: string[];
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
