import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { SubscriptionService } from './user-subscription.service';
import { CreateSubscriptionDto } from './dto/create-user-subscription.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSubscriptionByDoctorDto } from './dto/create-subscription-by-doctor.dto';
import { RejectSubscriptionDto } from './dto/reject-subscription.dto';
@Roles(UserRole.DOCTOR, UserRole.ADMIN)
@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
  @Roles(UserRole.PATIENT)
  @Post()
  @ApiOperation({
    summary: 'Create a new subscription',
    description:
      'Creates a new subscription for the currently authenticated doctor.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('paymentScreenshot'))
  createSubscription(
    @CurrentUserId() userId: string,
    @Body() dto: CreateSubscriptionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.subscriptionService.createSubscription(dto, userId, file);
  }

  @Post('create-by-doctor')
  @ApiOperation({
    summary: 'Doctor creates an active subscription directly for a user',
  })
  createSubscriptionByDoctor(
    @CurrentUserId() doctorId: string,
    @Body() dto: CreateSubscriptionByDoctorDto,
  ) {
    return this.subscriptionService.createSubscriptionByDoctor(doctorId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all subscriptions',
    description:
      'Returns a paginated list of subscriptions with optional filtering and sorting.',
  })
  getAllSubscriptions(@Query() query: BuildQueryDto) {
    return this.subscriptionService.getAllSubscriptions(query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending subscription requests' })
  getPendingSubscriptions(@Query() query: BuildQueryDto) {
    return this.subscriptionService.getPendingSubscriptions(query);
  }
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT)
  @Get('me')
  @ApiOperation({
    summary: 'Get current subscription',
    description:
      'Returns the currently active subscription of the authenticated user.',
  })
  getCurrentSubscription(@CurrentUserId() userId: string) {
    return this.subscriptionService.getCurrentSubscription(userId);
  }

  @Patch('approve/:id')
  @ApiOperation({ summary: 'Doctor approves a pending subscription' })
  approveSubscription(
    @Param('id') id: string,
    @CurrentUserId() doctorId: string,
  ) {
    return this.subscriptionService.approveSubscription(id, doctorId);
  }

  @Patch('reject')
  @ApiOperation({ summary: 'Doctor rejects a pending subscription' })
  rejectSubscription(
    @CurrentUserId() doctorId: string,
    @Body() dto: RejectSubscriptionDto,
  ) {
    return this.subscriptionService.rejectSubscription(doctorId, dto);
  }
  @Roles(UserRole.PATIENT)
  @Patch('me/cancel')
  @ApiOperation({
    summary: 'Patient cancels their own active subscription',
  })
  cancelMySubscription(@CurrentUserId() userId: string) {
    return this.subscriptionService.cancelMySubscription(userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel subscription',
    description: 'Cancels an existing subscription.',
  })
  cancelSubscription(@Param('id') subscriptionId: string) {
    return this.subscriptionService.cancelSubscription(subscriptionId);
  }
}
