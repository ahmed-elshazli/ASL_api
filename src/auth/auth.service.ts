import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';


import { USERS_REPOSITORY } from '../users/repositories/users.repository.interface';
import type { IUsersRepository } from '../users/repositories/users.repository.interface';
import type { LoginDto } from './dto/login.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { AuthResponseDto } from 'src/users/dto/response.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { createHash, randomInt } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {  RESET_CODE_EXPIRES_MS } from 'src/common/constants/security.constants';
import { AuthSessionService } from './services/auth-session.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  private readonly authSessionService: AuthSessionService,
    private readonly mailService: MailService,
  ) {}






async register(dto: RegisterDto): Promise<AuthResponseDto> {
  const existingUser = await this.usersRepository.findByEmail(dto.email);

  if (existingUser) {
    throw new ConflictException('User already exists');
  }

  const user = await this.usersRepository.create(dto);

  const tokens = await this.authSessionService.createSession(user);

 return {
    user: UserResponseDto.fromEntity(user),
    accessToken: tokens.accessToken,
}
}


  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findByEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact support.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    
   const tokens = await this.authSessionService.createSession(user);


 return {
    user: UserResponseDto.fromEntity(user),
    accessToken: tokens.accessToken,
}
}

  // Forgot Password

async forgotPassword(
  dto: ForgotPasswordDto,
): Promise<{ message: string }> {

  const user = await this.usersRepository.findByEmail(dto.email);

  if (!user) {
    throw new NotFoundException('No user found with this email');
  }

  const resetCode = randomInt(100000, 1000000).toString();

  const hashedResetCode = createHash('sha256')
    .update(resetCode)
    .digest('hex');

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = new Date(Date.now() + RESET_CODE_EXPIRES_MS);
  user.passwordResetVerified = false;

  await this.usersRepository.save(user);

  await this.mailService.sendResetPasswordEmail(
    user.email,
    user.fullName,
    resetCode,
  );
 

  return {
    message: 'Password reset code sent successfully.',
  };
}


async verifyResetCode(
  dto: VerifyResetCodeDto,
): Promise<{ message: string }> {
  const user = await this.usersRepository.findByEmailWithResetFields(
    dto.email,
  );

  if (!user) {
    throw new NotFoundException('No user found with this email');
  }

  if (user.passwordResetVerified) {
    throw new BadRequestException(
      'Reset code has already been verified.',
    );
  }

  const hashedResetCode = createHash('sha256')
    .update(dto.code)
    .digest('hex');

  if (user.passwordResetCode !== hashedResetCode) {
    throw new BadRequestException('Invalid reset code');
  }

  if (
    !user.passwordResetExpires ||
    user.passwordResetExpires.getTime() < Date.now()
  ) {
    throw new BadRequestException('Reset code has expired');
  }

  user.passwordResetVerified = true;

  await this.usersRepository.save(user);

  return {
    message: 'Reset code verified successfully.',
  };
}


async resetPassword(
  dto: ResetPasswordDto,
): Promise<{ message: string }> {
  const user = await this.usersRepository.findByEmailWithResetFields(
    dto.email,
  );

  if (!user) {
    throw new NotFoundException('No user found with this email');
  }

  if (!user.passwordResetVerified) {
    throw new BadRequestException(
      'Please verify your reset code first.',
    );
  }


  // Change password
  user.password = dto.newPassword;

  // Clear forgot password state
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = false;

  // Logout from all devices
  user.refreshToken = undefined;

  await this.usersRepository.save(user);

  return {
    message: 'Password reset successfully. Please login again.',
  };
}

  async logout(userId: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.refreshToken = undefined;
    await this.usersRepository.save(user);

    return { message: 'Logged out successfully' };
  }

  async getLoggedUser(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return {
      user: UserResponseDto.fromEntity(user),
    };
  }
}
