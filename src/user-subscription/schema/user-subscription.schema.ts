import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SubscriptionPlan } from 'src/subscription-plan/schema/subscription-plan.schema';
import { User } from 'src/users/schema/users.schema';

export type UserSubscriptionDocument =
  HydratedDocument<UserSubscription>;

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class UserSubscription {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: SubscriptionPlan.name,
    required: true,
  })
  planId: Types.ObjectId;

  @Prop({
    required: true,
  })
  amount: number;

  @Prop({
    required: true,
  })
  currency: string;

  @Prop({
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Prop()
  paymentGateway: string;

  @Prop()
  transactionId: string;

  @Prop()
  paymentReference: string;

  @Prop()
  paidAt: Date;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;
}

export const UserSubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription);

UserSubscriptionSchema.index({
  userId: 1,
  status: 1,
});

UserSubscriptionSchema.index({
  planId: 1,
});

UserSubscriptionSchema.index({
  paymentReference: 1,
});