import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';

import { Result } from './schemas/result.schema';
import { UploadService } from 'src/common/storage/upload.service';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ApiFeatures } from 'src/common/utils/api-features';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name)
    private readonly resultModel: Model<Result>,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    dto: CreateResultDto,
    files: Express.Multer.File[],
  ) {
    const images = files?.length
      ? await this.uploadService.upload(files)
      : [];

    return this.resultModel.create({
      ...dto,
      images,
    });
  }

  async findAll(query:BuildQueryDto) {
        const baseQuery = this.resultModel.find().lean();
    
        const features = new ApiFeatures(baseQuery, query)
          .filter()
          .search(['description']);
    
      
          const total = await features.count();
    
        features.sort().limitFields().paginate(total);
    
        const data = await features.exec();
    
        return {
          results: data.length,
          pagination: features.paginationResult,
          data,
        };
 
  }

  async findOne(id: string) {
    const result = await this.resultModel
      .findById(id)
      .lean()
      .exec();

    if (!result) {
      throw new NotFoundException('Result not found.');
    }

    return result;
  }

  async update(
    id: string,
    dto: UpdateResultDto,
    files?: Express.Multer.File[],
  ) {
    const result = await this.resultModel.findById(id);

    if (!result) {
      throw new NotFoundException('Result not found.');
    }

    if (files?.length) {
      const images = await this.uploadService.replace(result.images, files);
      result.images = images;
    }

    Object.assign(result, dto);

    return result.save();
  }

  async remove(id: string) {
    const result = await this.resultModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Result not found.');
    }

    return {
      message: 'Result deleted successfully.',
    };
  }
}