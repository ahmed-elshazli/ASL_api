import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProgramCategory } from '../enums/program-category.enum';
import { ProgramLevel } from '../enums/program-level.enum';
import {
  ProgramExercise,
  ProgramExerciseSchema,
} from './program-exercise.schema';

export type TrainingProgramDocument = HydratedDocument<TrainingProgram>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class TrainingProgram {
  @Prop({
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 500,
  })
  description: string;

  @Prop({
    type: String,
    enum: ProgramCategory,
    required: true,
    index: true,
  })
  category: ProgramCategory;

  @Prop({
    type: String,
    enum: ProgramLevel,
    required: true,
    index: true,
  })
  level: ProgramLevel;

  @Prop({ type: [ProgramExerciseSchema], default: [] })
  exercises: ProgramExercise[];

  @Prop({
    required: true,
    min: 1,
  })
  duration: number;

  @Prop({
    required: true,
    min: 0,
  })
  minCalories: number;

  @Prop({
    required: true,
    min: 0,
  })
  maxCalories: number;

  @Prop({
    default: false,
    index: true,
  })
  isPremium: boolean;

  @Prop({
    default: true,
    index: true,
  })
  isActive: boolean;
}

export const TrainingProgramSchema =
  SchemaFactory.createForClass(TrainingProgram);

TrainingProgramSchema.index({
  category: 1,
  level: 1,
  isActive: 1,
});
