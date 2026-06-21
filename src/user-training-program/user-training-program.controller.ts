import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,

} from '@nestjs/common';
import { UserTrainingProgramService } from './user-training-program.service';
import { AssignProgramDto } from './dto/create-user-training-program.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
@Controller('user-training-program')
export class UserTrainingProgramController {
  constructor(private readonly service: UserTrainingProgramService) {}

  @Post('assign')
  assign(@Body() dto: AssignProgramDto) {
    return this.service.assignPrograms(dto);
  }
  @Get("myPrograms")
  getMyPrograms(@CurrentUser('_id') userId: string) {
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
  return this.service.removeProgram(userId, programId);
}
}
