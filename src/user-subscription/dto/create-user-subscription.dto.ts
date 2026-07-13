import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Subscription plan ID' })
  @IsMongoId()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ description: 'Payment method' })
  @IsMongoId()
  @IsNotEmpty()
  paymentMethodId: string;

  @ApiProperty({ description: 'Phone number the payment was sent from' })
  @IsString()
  @IsNotEmpty()
  senderNumber: string;




}