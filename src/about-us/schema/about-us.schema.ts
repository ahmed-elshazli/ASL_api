import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AboutUsDocument = HydratedDocument<AboutUs>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class AboutUs {
  @Prop({
    required: true,
    trim: true,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    trim: true,
    default: null,
  })
  founderImage?: string;

  @Prop({
    type: [String],
    default: [],
  })
  certificationImages: string[];

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    trim: true,
    default: null,
  })
  facebook?: string;

  @Prop({
    trim: true,
    default: null,
  })
  instagram?: string;

  @Prop({
    trim: true,
    default: null,
  })
  whatsapp?: string;

  @Prop({
    trim: true,
    default: null,
  })
  tiktok?: string;
}

export const AboutUsSchema = SchemaFactory.createForClass(AboutUs);