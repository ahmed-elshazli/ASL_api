import { Controller, Get, Param, Query } from '@nestjs/common';
import { PatientDashboardService } from './patient-dashboard.service';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/users/enums/roles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { WeightLogService } from 'src/weight-log/weight-log.service';
import {
  ApiBearerAuth,
  ApiOperation,

  ApiTags,
} from '@nestjs/swagger';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';

@ApiTags('Patient Dashboard')
@ApiBearerAuth()
@Controller('patient-dashboard')
export class PatientDashboardController {
  constructor(
    private readonly patientDashboardService: PatientDashboardService,
    private readonly weightLogService: WeightLogService,
  ) {}

  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  @Get('me')
  @ApiOperation({
    summary: 'Get current user dashboard',
    description:
      'Returns dashboard data for the currently authenticated user.',
  })

  async getMyDashboard(
    @CurrentUserId() userId: string,
  ) {
    return this.patientDashboardService.getDashboard(userId);
  }

  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  @Get('weight-history')
  async getWeightHistory(@CurrentUserId() userId: string) {
     console.log('Current User Id:', userId);
    return this.weightLogService.getWeightHistory(userId);
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Get patient dashboard by user ID',
    description:
      'Returns dashboard data for a specific user using their ID.',
  })

 @Roles( UserRole.DOCTOR, UserRole.ADMIN)
  async Dashboard(
    @Param('userId') userId: string,
  ) {
    return this.patientDashboardService.getDashboard(userId);
  }


}