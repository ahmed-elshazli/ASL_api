import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { AboutUsService } from './about-us.service';
import { CreateAboutUsDto } from './dto/create-about-us.dto';
import { UpdateAboutUsDto } from './dto/update-about-us.dto';
import type  { AboutUsFiles } from './interfaces/about-us-files.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';

@Roles(UserRole.DOCTOR,UserRole.ADMIN)

@Controller('about-us')
export class AboutUsController {
  constructor(
    private readonly aboutUsService: AboutUsService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'founderImage',
        maxCount: 1,
      },
      {
        name: 'certificationImages',
        maxCount: 10,
      },
    ]),
  )
  create(
    @Body(new ValidationPipe({ whitelist: true }))
    dto: CreateAboutUsDto,

    @UploadedFiles()
    files: AboutUsFiles,
  ) {
    return this.aboutUsService.create(dto, files);
  }

  @Get()
  findOne() {
    return this.aboutUsService.findOne();
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'founderImage',
        maxCount: 1,
      },
      {
        name: 'certificationImages',
        maxCount: 10,
      },
    ]),
  )
  update(
    @Body(new ValidationPipe({ whitelist: true }))
    dto: UpdateAboutUsDto,

    @UploadedFiles()
    files: AboutUsFiles,
  ) {
    return this.aboutUsService.update(dto, files);
  }

  @Delete()
  remove() {
    return this.aboutUsService.remove();
  }
}