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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';

@ApiTags('Exercises')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 3))
  @ApiOperation({ summary: 'Create a new exercise' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'Exercise created successfully' })
  create(
    @Body() dto: CreateExerciseDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.exerciseService.create(dto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exercises' })
  @ApiOkResponse({ description: 'List of exercises returned successfully' })
  findAll(@Query() query: BuildQueryDto) {
    return this.exerciseService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single exercise by ID' })
  @ApiParam({ name: 'id', description: 'Exercise MongoDB ID' })

  findOne(@Param('id') id: string) {
    return this.exerciseService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 3))
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Exercise MongoDB ID' })

  update(
    @Param('id') id: string,
    @Body() dto: UpdateExerciseDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.exerciseService.update(id, dto, files);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an exercise by ID' })
  @ApiParam({ name: 'id', description: 'Exercise MongoDB ID' })
 
  remove(@Param('id') id: string) {
    return this.exerciseService.remove(id);
  }
}