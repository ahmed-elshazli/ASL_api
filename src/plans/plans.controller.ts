import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PlansService } from './plans.service';
import { CreateNutritionPlanDto } from './dto/create-plan.dto';
import { UpdateNutritionPlanDto } from './dto/update-plan.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/users/enums/roles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';



@ApiBearerAuth()
@Roles(UserRole.ADMIN,UserRole.DOCTOR)
@ApiTags('Nutrition Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

 
  @Post()
  @ApiOperation({ summary: 'Create nutrition plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  async create(
    @Body() dto: CreateNutritionPlanDto,
    @CurrentUserId() createdBy: string,
  ) {
  
    return this.plansService.create(dto, createdBy);
  }


  @Get()
  @ApiOperation({ summary: 'Get all nutrition plans' })

  async findAll(@Query() query: BuildQueryDto) {
    return this.plansService.findAll(query);
  }


  @Get('/client/:id')
  @ApiOperation({ summary: 'Get plans by client/patient id' })
  @ApiParam({ name: 'id', description: 'Client/Patient ID' })
  async findByClient(
    @Param('id') id: string,
    @Query() query: BuildQueryDto,
  ) {
    return this.plansService.findByClient(id, query);
  }


  @Get('/:id')
  @ApiOperation({ summary: 'Get single nutrition plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  async findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }


  @Put('/:id')
  @ApiOperation({ summary: 'Update nutrition plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNutritionPlanDto,
  ) {
    return this.plansService.update(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete nutrition plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}