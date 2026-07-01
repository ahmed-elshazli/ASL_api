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
import type { AboutUsFiles } from './interfaces/about-us-files.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('About Us')
@ApiBearerAuth()
@Roles(UserRole.DOCTOR, UserRole.ADMIN)
@Controller('about-us')
export class AboutUsController {
  constructor(private readonly aboutUsService: AboutUsService) {}

  @ApiOperation({
    summary: 'Create About Us',
  })
  @ApiConsumes('multipart/form-data')
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

  @ApiOperation({
    summary: 'Get About Us',
  })
  @Public()
  @Get()
  findOne() {
    return this.aboutUsService.findOne();
  }
  @ApiOperation({
    summary: 'Update About Us',
  })
  @ApiConsumes('multipart/form-data')
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

  @ApiOperation({
    summary: 'Delete About Us',
  })
  @Delete()
  remove() {
    return this.aboutUsService.remove();
  }
}
