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
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserTrainingProgramService } from './user-training-program.service';
import { AssignProgramDto } from './dto/create-user-training-program.dto';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { CompleteExerciseDto } from './dto/complete-exercise.dto';

@ApiTags('User Training Programs')
@Roles(UserRole.DOCTOR, UserRole.ADMIN)
@Controller('user-training-program')
export class UserTrainingProgramController {
  constructor(private readonly service: UserTrainingProgramService) {}

  @ApiOperation({ summary: 'Assign a training program to a user' })
  @Post('assign')
  assign(@Body() dto: AssignProgramDto) {
    return this.service.assignProgram(dto);
  }

  @ApiOperation({ summary: 'Get all user training programs' })
  @Get()
  getAll(@Query() query: BuildQueryDto) {
    return this.service.findAll(query);
  }

  @ApiOperation({ summary: 'Get my assigned programs' })
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  @Get('my-programs')
  getMyPrograms(@CurrentUserId() userId: string) {
    return this.service.getUserPrograms(userId);
  }

  @ApiOperation({ summary: 'Get all programs assigned to a specific user' })
  @ApiParam({ name: 'userId', type: String })
  @Get('user/:userId')
  getUserPrograms(@Param('userId') userId: string) {
    return this.service.getUserPrograms(userId);
  }

  @ApiOperation({ summary: 'Get all users assigned to a specific program' })
  @ApiParam({ name: 'programId', type: String })
  @Get('program/:programId/users')
  getProgramUsers(@Param('programId') programId: string) {
    return this.service.getProgramUsers(programId);
  }

  @ApiOperation({ summary: 'Remove a program assignment from a user' })
  @ApiParam({ name: 'userId', type: String })
  @ApiParam({ name: 'programId', type: String })
  @Delete(':userId/:programId')
  remove(
    @Param('userId') userId: string,
    @Param('programId') programId: string,
  ) {
    return this.service.deleteUserProgram(userId, programId);
  }

  @ApiOperation({ summary: 'Mark an exercise as completed' })
@ApiParam({ name: 'programId', type: String })
@Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
@Patch(':programId/complete-exercise')
completeExercise(
  @Param('programId') programId: string,
  @Body() dto: CompleteExerciseDto,
  @CurrentUserId() userId: string,
) {
  return this.service.completeExercise(programId, userId, dto);
}
}