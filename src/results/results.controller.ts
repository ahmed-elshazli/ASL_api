import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { ResultsService } from './results.service';

import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { UserRole } from 'src/users/enums/roles.enum';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';

@ApiTags('Results')
@Roles(UserRole.DOCTOR, UserRole.ADMIN)
@Controller('results')
export class ResultsController {
  constructor(
    private readonly resultsService: ResultsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new result' })
  @ApiConsumes('multipart/form-data')

  @UseInterceptors(FilesInterceptor('images', 5))
  create(
    @Body() dto: CreateResultDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.resultsService.create(dto, files);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all results' })
  findAll(
    @Query() query: BuildQueryDto,
  ) {
    return this.resultsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get result by id' })
  @ApiParam({
    name: 'id',
    description: 'Result ID',
  })
  findOne(
    @Param('id') id: string,
  ) {
    return this.resultsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a result' })
  @ApiParam({
    name: 'id',
    description: 'Result ID',
  })
  @ApiConsumes('multipart/form-data')

  @UseInterceptors(FilesInterceptor('images', 5))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResultDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.resultsService.update(id, dto, files);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a result' })
  @ApiParam({
    name: 'id',
    description: 'Result ID',
  })
  remove(
    @Param('id') id: string,
  ) {
    return this.resultsService.remove(id);
  }
}