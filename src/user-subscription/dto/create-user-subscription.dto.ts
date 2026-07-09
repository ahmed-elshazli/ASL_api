import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'The ID of the user who will own the subscription.',
    example: '686d43fd7c2d63c7f3a6f2d1',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The ID of the subscription plan.',
    example: '686d44037c2d63c7f3a6f2d9',
  })
  @IsMongoId()
  @IsNotEmpty()
  planId: string;
}