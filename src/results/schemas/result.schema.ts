import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResultDocument = HydratedDocument<Result>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Result {
  @Prop({
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    type: [String],
    default: [],
  })
  images: string[];
}

export const ResultSchema = SchemaFactory.createForClass(Result);