import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectSubscriptionDto {
  @ApiProperty({ description: 'Reason for rejecting the subscription request' })
  @IsString()
  @IsNotEmpty()
  rejectReason: string;

  @ApiProperty({ description: 'Subscription ID' })
  @IsNotEmpty()
  subscriptionId: string;
}