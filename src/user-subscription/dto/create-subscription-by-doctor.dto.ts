import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionByDoctorDto {
  @ApiProperty({ description: 'User (patient) ID' })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Subscription plan ID' })
  @IsMongoId()
  @IsNotEmpty()
  planId: string;
}