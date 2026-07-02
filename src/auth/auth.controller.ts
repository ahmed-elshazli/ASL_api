import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  UseInterceptors,
  UploadedFiles,
  Get,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


@ApiTags('Auth')
@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 60000 } })
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User register' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({ description: 'User logged in successfully' })
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

@ApiOperation({ summary: 'Get logged in user profile' })
@ApiBearerAuth()
@Get('profile')
getLoggedUser(@CurrentUserId() userId: string) {
  return this.authService.getLoggedUser(userId);
}

  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'User logged out successfully' })
 
  @Post('logout/:id')
  async logout(@Param('id') userId: string) {
    return this.authService.logout(userId);
  }


@ApiOperation({
  summary: 'Send password reset code',
  description: 'Send a password reset verification code to the user email.',
})

@Throttle({ default: { limit: 3, ttl: 60000 } })
@Public()
@Post('forgot-password')
forgotPassword(
  @Body() dto: ForgotPasswordDto,
) {
  return this.authService.forgotPassword(dto);
}


@ApiOperation({
  summary: 'Verify password reset code',
  description: 'Verify the password reset code sent to the user email.',
})
@Public()
@Post('verify-reset-code')
verifyResetCode(
  @Body() dto: VerifyResetCodeDto,
) {
  return this.authService.verifyResetCode(dto);
}

@ApiOperation({
  summary: 'Reset password',
  description: 'Reset the user password using the verified reset code.',
})

@Public()
@Patch('reset-password')
resetPassword(
  @Body() dto: ResetPasswordDto,
) {
  return this.authService.resetPassword(dto);
}

 
}