import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class CompletedExercise {
  @Prop({
    type: Types.ObjectId,
    ref: 'Exercise',
    required: true,
  })
  exerciseId: Types.ObjectId;

@Prop({
    required: true,
    min: 0,
  })
  round: number;

  @Prop({
    type: Date,
    default: () => new Date(),
  })
  completedAt: Date;
}

export const CompletedExerciseSchema =
  SchemaFactory.createForClass(CompletedExercise);