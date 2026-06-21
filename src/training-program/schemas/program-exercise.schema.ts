import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Exercise } from "src/exercises/schemas/exercise.schema";

@Schema({ _id: false })
export class ProgramExercise {
  @Prop({
    type: Types.ObjectId,
    ref: Exercise.name,
    required: true,
  })
  exerciseId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  order: number;

  @Prop({ min: 1 })
  sets?: number;

  @Prop({ trim: true })
  repsOrDuration?: string; // "15-20 reps" or "30 seconds"
}

export const ProgramExerciseSchema = SchemaFactory.createForClass(ProgramExercise);