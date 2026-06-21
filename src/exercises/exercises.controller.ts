import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ExerciseService } from './exercises.service';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files',3))
  create(
    @Body() dto: CreateExerciseDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.exerciseService.create(dto, files);
  }

  @Get()
  findAll(@Query() query: BuildQueryDto) {
    return this.exerciseService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exerciseService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExerciseDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.exerciseService.update(id, dto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exerciseService.remove(id);
  }
}