import { PartialType } from '@nestjs/swagger';
import {  CreateSubscriptionDto } from './create-user-subscription.dto';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto ) {}
