import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Currency } from '../enums/currency.enum';
import { BillingCycle } from '../enums/billing-cycle.enum';

export type SubscriptionPlanDocument =
  HydratedDocument<SubscriptionPlan>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class SubscriptionPlan {
  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  name: string;

  @Prop({
    trim: true,
    default: '',
  })
  description: string;

  @Prop({
    required: true,
    min: 0,
  })
  price: number;

  @Prop({
    enum: Currency,
    default: Currency.EGP 
 })
  currency: Currency;

  @Prop({
    enum: BillingCycle,
    required: true,
  })
  billingCycle: BillingCycle;

  @Prop({
    required: true,
    min: 1,
  })
  durationInDays: number;

  @Prop({
    type: [String],
    default: [],
  })
  features: string[];

  @Prop({
    default: false,
  })
  isPopular: boolean;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    default: 0,
  })
  sortOrder: number;
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan); 