import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { Match } from 'src/common/validators/match.validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Registered email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword@123',
    description:
      'New password. Must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}\-_=+|:;"'<>,./~`]).+$/,
    {
      message:
        'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
    },
  )
  newPassword: string;

  @ApiProperty({
    example: 'StrongPassword@123',
    description: 'Must match the new password.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Match('newPassword', {
    message: 'Passwords do not match.',
  })
  confirmPassword: string;
}