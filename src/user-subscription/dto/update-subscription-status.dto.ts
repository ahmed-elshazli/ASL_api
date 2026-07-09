import { IsEnum } from 'class-validator';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

export class UpdateSubscriptionStatusDto {
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;
}