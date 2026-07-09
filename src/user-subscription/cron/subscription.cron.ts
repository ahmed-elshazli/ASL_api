import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SubscriptionService } from '../user-subscription.service';

@Injectable()
export class SubscriptionCron {
  private readonly logger = new Logger(SubscriptionCron.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async expireSubscriptions() {
    const expired =
      await this.subscriptionService.expireSubscriptions();

    this.logger.log(`${expired} subscriptions expired.`);
  }
}