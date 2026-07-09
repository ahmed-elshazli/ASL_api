import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SubscriptionService } from './user-subscription.service';
import { CreateSubscriptionDto } from './dto/create-user-subscription.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';
@Roles(UserRole.DOCTOR, UserRole.ADMIN)
@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly userSubscriptionService: SubscriptionService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new subscription',
    description: 'Creates a new subscription for the currently authenticated doctor.',
  })

  createSubscription(
    @CurrentUserId() doctorId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.userSubscriptionService.createSubscription(
      doctorId,
      dto,
    );
  }
@Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT)
  @Get('me')
  @ApiOperation({
    summary: 'Get current subscription',
    description: 'Returns the currently active subscription of the authenticated user.',
  })

  getCurrentSubscription(
    @CurrentUserId() userId: string,
  ) {
    return this.userSubscriptionService.getCurrentSubscription(
      userId,
    );
  }
@Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT)
  @Get('history')
  @ApiOperation({
    summary: 'Get subscription history',
    description: 'Returns all subscriptions (active, expired, cancelled) for the authenticated user.',
  })

  getSubscriptionHistory(
    @CurrentUserId() userId: string,
  ) {
    return this.userSubscriptionService.getSubscriptionHistory(
      userId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all subscriptions',
    description: 'Returns a paginated list of subscriptions with optional filtering and sorting.',
  })


  getAllSubscriptions(
    @Query() query: BuildQueryDto,
  ) {
    return this.userSubscriptionService.getAllSubscriptions(
      query,
    );
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel subscription',
    description: 'Cancels an existing subscription.',
  })

 
  cancelSubscription(
    @Param('id') subscriptionId: string,
  ) {
    return this.userSubscriptionService.cancelSubscription(
      subscriptionId,
    );
  }
}