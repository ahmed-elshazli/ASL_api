import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Subscription Plans')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@Controller('subscription-plans')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription plan' })

  create(@Body() createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.create(createSubscriptionPlanDto);
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })

  findAll(@Query() query: BuildQueryDto) {
    return this.subscriptionPlanService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription plan by ID' })

  findOne(@Param('id') id: string) {
    return this.subscriptionPlanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscription plan' })
  @ApiParam({ name: 'id', description: 'Subscription plan ID' })

  update(
    @Param('id') id: string,
    @Body() updateSubscriptionPlanDto: UpdateSubscriptionPlanDto,
  ) {
    return this.subscriptionPlanService.update(id, updateSubscriptionPlanDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle active/inactive status of a plan' })
  @ApiParam({ name: 'id', description: 'Subscription plan ID' })
 
  toggleStatus(@Param('id') id: string) {
    return this.subscriptionPlanService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscription plan' })
  @ApiParam({ name: 'id', description: 'Subscription plan ID' })

  remove(@Param('id') id: string) {
    return this.subscriptionPlanService.remove(id);
  }
}