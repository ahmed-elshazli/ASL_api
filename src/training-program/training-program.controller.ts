import { ParseObjectIdPipe } from '@nestjs/mongoose';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { TrainingProgramService } from './training-program.service';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { UpdateTrainingProgramDto } from './dto/update-training-program.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';

@Controller('training-programs')
export class TrainingProgramController {
  constructor(
    private readonly trainingProgramService: TrainingProgramService,
  ) {}

  @Post()
  create(@Body() createTrainingProgramDto: CreateTrainingProgramDto) {
    return this.trainingProgramService.create(createTrainingProgramDto);
  }

  @Get()
  findAll(@Query() query: BuildQueryDto) {
    return this.trainingProgramService.findAll(query);
  }

  @Get(':id')
  findOne( @Param('id' , ParseObjectIdPipe) id: string) {
    return this.trainingProgramService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id' , ParseObjectIdPipe) id: string,
   
    @Body() updateTrainingProgramDto: UpdateTrainingProgramDto,
  ) {
    return this.trainingProgramService.update(id, updateTrainingProgramDto);
  }

  @Delete(':id')
  remove(@Param('id' , ParseObjectIdPipe) id: string) {
    return this.trainingProgramService.remove(id);
  }
}