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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { TrainingProgramService } from './training-program.service';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { UpdateTrainingProgramDto } from './dto/update-training-program.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';

@ApiTags('Training Programs')
@ApiBearerAuth()
@Controller('training-programs')
export class TrainingProgramController {
  constructor(
    private readonly trainingProgramService: TrainingProgramService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new training program' })

  create(@Body() createTrainingProgramDto: CreateTrainingProgramDto) {
    return this.trainingProgramService.create(createTrainingProgramDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all training programs' })
  findAll(@Query() query: BuildQueryDto) {
    return this.trainingProgramService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single training program by ID' })
  @ApiParam({ name: 'id', description: 'Training program MongoDB ID' })

  findOne(@Param('id') id: string) {
    return this.trainingProgramService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a training program by ID' })
  @ApiParam({ name: 'id', description: 'Training program MongoDB ID' })

  update(
    @Param('id') id: string,
    @Body() updateTrainingProgramDto: UpdateTrainingProgramDto,
  ) {
    return this.trainingProgramService.update(id, updateTrainingProgramDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a training program by ID' })
  @ApiParam({ name: 'id', description: 'Training program MongoDB ID' })

  remove(@Param('id') id: string) {
    return this.trainingProgramService.remove(id);
  }
}