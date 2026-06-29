import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateAboutUsDto } from './dto/create-about-us.dto';
import { UpdateAboutUsDto } from './dto/update-about-us.dto';
import { AboutUs, AboutUsDocument } from './schema/about-us.schema';
import { UploadService } from 'src/common/storage/upload.service';
import { AboutUsFiles } from './interfaces/about-us-files.interface';

@Injectable()
export class AboutUsService {
  constructor(
    @InjectModel(AboutUs.name)
    private readonly aboutUsModel: Model<AboutUsDocument>,
    private readonly uploadService: UploadService,
  ) {}

  private async findAboutUsOrFail(): Promise<AboutUsDocument> {
    const aboutUs = await this.aboutUsModel.findOne().exec();

    if (!aboutUs) {
      throw new NotFoundException('About Us not found');
    }

    return aboutUs;
  }

  async create(
    dto: CreateAboutUsDto,
    files: AboutUsFiles,
  ): Promise<AboutUsDocument> {
    const exists = await this.aboutUsModel.exists({}).exec();

    if (exists) {
      throw new ConflictException('About Us already exists');
    }

    // Uploads

    const [founderImage, certificationImages] = await Promise.all([
      files.founderImage?.length
        ? this.uploadService.uploadSingle(files.founderImage[0])
        : Promise.resolve(undefined),

      files.certificationImages?.length
        ? this.uploadService.upload(files.certificationImages)
        : Promise.resolve([]),
    ]);
    const aboutUs = await this.aboutUsModel.create({
      ...dto,
      founderImage,
      certificationImages,
    });
    return aboutUs;
  }

  async findOne() {
    const aboutUs = await this.aboutUsModel.findOne().lean().exec();

    if (!aboutUs) {
      throw new NotFoundException('About Us not found');
    }

    return aboutUs;
  }

  async update(dto: UpdateAboutUsDto, files: AboutUsFiles) {
    const aboutUs = await this.findAboutUsOrFail();

    if (files.founderImage?.length) {
      const [image] = await this.uploadService.replace(
        aboutUs.founderImage ? [aboutUs.founderImage] : [],
        files.founderImage,
      );

      aboutUs.founderImage = image;
    }

    if (files.certificationImages?.length) {
      aboutUs.certificationImages = await this.uploadService.replace(
        aboutUs.certificationImages,
        files.certificationImages,
      );
    }

    aboutUs.set(dto);

    return aboutUs.save();
  }

  async remove() {
    const aboutUs = await this.findAboutUsOrFail();

    const images = [
      ...(aboutUs.founderImage ? [aboutUs.founderImage] : []),
      ...aboutUs.certificationImages,
    ];

    if (images.length) {
      await this.uploadService.deleteImages(images);
    }

    await aboutUs.deleteOne();

    return {
      message: 'About Us deleted successfully',
    };
  }
}
