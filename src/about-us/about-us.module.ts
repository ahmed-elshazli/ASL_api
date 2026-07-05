import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AboutUsController } from './about-us.controller';
import { AboutUsService } from './about-us.service';
import {
  AboutUs,
  AboutUsSchema,
} from './schema/about-us.schema';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AboutUs.name,
        schema: AboutUsSchema,
      },
    ]),
    StorageModule,
   
  ],
  controllers: [AboutUsController],
  providers: [AboutUsService],
  exports: [AboutUsService],
})
export class AboutUsModule {}