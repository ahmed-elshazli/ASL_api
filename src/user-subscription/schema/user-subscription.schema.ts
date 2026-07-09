import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { User } from 'src/users/schema/users.schema';
import { SubscriptionPlan } from 'src/subscription-plan/schema/subscription-plan.schema';

export type SubscriptionDocument =
  HydratedDocument<Subscription>;

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
    required: true,
  })
  startDate: Date;

  @Prop({
    required: true,
    index: true,
  })
  endDate: Date;

  @Prop({
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
    index: true,
  })
  status: SubscriptionStatus;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  approvedBy: Types.ObjectId;
}

export const SubscriptionSchema =
  SchemaFactory.createForClass(Subscription);

  SubscriptionSchema.index({
  user: 1,
  status: 1,
});

SubscriptionSchema.index({
  endDate: 1,
  status: 1,
});