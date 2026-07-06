 import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PaymentMethodType } from '../enums/payment-method-type.enum';

export type PaymentMethodDocument = HydratedDocument<PaymentMethod>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class PaymentMethod {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    enum: PaymentMethodType,
  })
  type: PaymentMethodType;

  @Prop({
    required: true,
    trim: true,
  })
  accountName: string;

  @Prop({
    required: true,
    trim: true,
  })
  accountNumber: string;

  @Prop({type: String})
  qrCode: string;

  @Prop({type: String})
  instructions: string;

  @Prop({
    default: true,
  })
  isActive: boolean;



}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);