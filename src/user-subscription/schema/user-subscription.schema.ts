import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { User } from 'src/users/schema/users.schema';
import { SubscriptionPlan } from 'src/subscription-plan/schema/subscription-plan.schema';
import { PaymentMethod } from 'src/payment-methods/schemas/payment-method.schema';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Subscription {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: SubscriptionPlan.name,
    required: true,
  })
  plan: Types.ObjectId;

  @Prop({
  type:String,
   
  })
  paymentMethod: string;

  @Prop({
   type: String,
    trim: true,
  })
  senderNumber: string;



  @Prop({
   type: String,
  })
  paymentScreenshot: string;

  @Prop()
  startDate?: Date;

  @Prop({
    index: true,
  })
  endDate?: Date;

  @Prop({
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
    index: true,
  })
  status: SubscriptionStatus;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
  })
  approvedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop({
    trim: true,
  })
  rejectReason?: string;

  @Prop()
  createdAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({
  user: 1,
  status: 1,
});

SubscriptionSchema.index({
  endDate: 1,
  status: 1,
});

SubscriptionSchema.index({
  status: 1,
  createdAt: -1,
});

SubscriptionSchema.index({
  approvedBy: 1,
});
