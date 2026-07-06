import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaymentMethodType } from '../enums/payment-method-type.enum';

export class CreatePaymentMethodDto {
  @ApiProperty({
    example: 'Vodafone Cash',
    description: 'Payment method name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: PaymentMethodType,
    example: PaymentMethodType.VODAFONE_CASH,
    description: 'Payment method type',
  })
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty({
    example: 'Ahmed Mohamed',
    description: 'Account holder name',
  })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({
    example: '01012345678',
    description: 'Account number, phone number, or Instapay address',
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiPropertyOptional({
    example: 'https://your-domain.com/uploads/qr-code.png',
    description: 'QR Code image URL',
  })
  @IsOptional()
  @IsString()
  qrCode?: string;

  @ApiPropertyOptional({
    example: 'Transfer the amount and upload the payment receipt.',
    description: 'Payment instructions for users',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}