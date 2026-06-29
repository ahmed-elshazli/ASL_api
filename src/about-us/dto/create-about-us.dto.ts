import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateAboutUsDto {
  @IsString()
  @MaxLength(150)
  title: string;

  @IsString()
  @MaxLength(5000)
  description: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsUrl()
  founderImage?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  certificationImages?: string[];

  @IsOptional()
  @IsUrl()
  facebook?: string;

  @IsOptional()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsUrl()
  tiktok?: string;

  @IsOptional()
  @IsUrl()
  whatsapp?: string;
}