import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateAboutUsDto {
  @ApiProperty({
    example: 'About Our Clinic',
    maxLength: 150,
  })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({
    example: 'We provide high quality healthcare services...',
    maxLength: 5000,
  })
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiProperty({
    example: 'info@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Founder image',
  })
  @IsOptional()
  founderImage?: any;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Certification images',
  })
  @IsOptional()
  certificationImages?: any[];

  @ApiPropertyOptional({
    example: 'https://facebook.com/clinic',
  })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({
    example: 'https://instagram.com/clinic',
  })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({
    example: 'https://tiktok.com/@clinic',
  })
  @IsOptional()
  @IsUrl()
  tiktok?: string;

  @ApiPropertyOptional({
    example: 'https://wa.me/201234567890',
  })
  @IsOptional()
  @IsUrl()
  whatsapp?: string;
}