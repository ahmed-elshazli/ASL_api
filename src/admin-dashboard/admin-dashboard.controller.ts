import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminDashboardService } from './admin-dashboard.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Get dashboard overview analytics',
    description:
      'Returns main dashboard KPIs including users, subscriptions, plans, and revenue statistics.',
  })
  async overview() {
    return this.adminDashboardService.getOverview();
  }

  @Get('growth')
  @ApiOperation({
    summary: 'Get dashboard growth analytics',
    description:
      'Returns users growth and subscriptions growth analytics grouped by month.',
  })
  async getGrowth() {
    return this.adminDashboardService.getGrowth();
  }

@Get('activity')
@ApiOperation({
  summary: 'Get dashboard activity analytics',
  description:
    'Returns recent system activities including user registrations, subscriptions, reviews, and weight updates.',
})

getActivity() {
  return this.adminDashboardService.getActivity();
}
}
