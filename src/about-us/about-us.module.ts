import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AboutUsController } from './about-us.controller';
import { AboutUsService } from './about-us.service';
import {
  AboutUs,
  AboutUsSchema,
} from './schema/about-us.schema';
import { UploadService } from 'src/common/storage/upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AboutUs.name,
        schema: AboutUsSchema,
      },
    ]),
   
  ],
  controllers: [AboutUsController],
  providers: [AboutUsService,UploadService],
  exports: [AboutUsService],
})
export class AboutUsModule {}