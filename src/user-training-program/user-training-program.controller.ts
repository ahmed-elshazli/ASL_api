import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,

} from '@nestjs/common';
import { UserTrainingProgramService } from './user-training-program.service';
import { AssignProgramDto } from './dto/create-user-training-program.dto';
import { CurrentUser, CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
@Roles(UserRole.DOCTOR,UserRole.ADMIN)
@Controller('user-training-program')
export class UserTrainingProgramController {
  constructor(private readonly service: UserTrainingProgramService) {}

  @Post('assign')
  assign(@Body() dto: AssignProgramDto) {
    return this.service.assignProgram(dto);
  }

  @Get()
  async getAll(@Query() query: BuildQueryDto){
    return this.service.findAll(query)
  }
@Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
@Get('my-programs')
getMyPrograms(@CurrentUserId() userId: string) {
  return this.service.getUserPrograms(userId);
}

  

@Get(':userId')
getUserPrograms(@Param('userId') userId: string) {
  return this.service.getUserPrograms(userId);

}

@Get(':programId/users')
getProgramUsers(@Param('programId') programId: string) {
  return this.service.getProgramUsers(programId);
}




@Delete(':userId/:programId')
remove(
  @Param('userId') userId: string,
  @Param('programId') programId: string,
) {
  return this.service.deleteUserProgram(userId, programId);
}
}
