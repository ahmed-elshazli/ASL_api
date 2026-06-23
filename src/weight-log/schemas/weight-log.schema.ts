import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WeightLogDocument = HydratedDocument<WeightLog>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class WeightLog {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    min: 20,
    max: 300,
  })
  weight: number;
  @Prop()
   createdAt: Date;
}

export const WeightLogSchema =
  SchemaFactory.createForClass(WeightLog);

WeightLogSchema.index({
  userId: 1,
  createdAt: -1,
});