import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateWebsiteReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Rating of the website from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Amazing website with great UX and performance.',
    description: 'User review comment',
    minLength: 5,
    maxLength: 1000,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  comment: string;
}