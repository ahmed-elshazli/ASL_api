import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {SubscriptionService } from './user-subscription.service';
import { CreateSubscriptionDto } from './dto/create-user-subscription.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly userSubscriptionService: SubscriptionService,
  ) {}


  @Post()
  createSubscription(
    @CurrentUserId() doctorId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.userSubscriptionService.createSubscription(
      doctorId,
      dto,
    );
  }


  @Get('me')
  getCurrentSubscription(
   @CurrentUserId() userId: string,
  ) {
    return this.userSubscriptionService.getCurrentSubscription(
      userId,
    );
  }

  /**
   * Current logged in user subscription history
   */
  @Get('history')
  getSubscriptionHistory(
    @CurrentUserId() userId: string,
  ) {
    return this.userSubscriptionService.getSubscriptionHistory(
      userId,
    );
  }

  
  @Get()
  getAllSubscriptions(
    @Query() query: BuildQueryDto,
  ) {
    return this.userSubscriptionService.getAllSubscriptions(
      query,
    );
  }


  @Patch(':id/cancel')
  cancelSubscription(
    @Param('id') subscriptionId: string,
  ) {
    return this.userSubscriptionService.cancelSubscription(
      subscriptionId,
    );
  }
}