import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { IsInternationalPhoneNumber } from 'src/common/validators/is-phone.validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Ahmed Mohamed',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  fullName: string;

  @ApiProperty({
    example: 'ahmed@example.com',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+201001234567',
  })
  @IsOptional()
  @IsString()
  @IsInternationalPhoneNumber({
    message: 'Invalid phone number',
  })
  phone: string;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  weight: number;
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(250)
  height: number;
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(120)
  age: number;
  @IsOptional()
  @IsEnum(['male', 'female'])
  gender: string;

  @IsOptional()
  @IsString()
  country: string;
}
