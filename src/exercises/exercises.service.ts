import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exercise, ExerciseDocument } from './schemas/exercise.schema';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ApiFeatures } from 'src/common/utils/api-features';
import { UploadService } from 'src/common/storage/upload.service';
import { UploadQueueService } from 'src/upload-queue/upload-queue.service';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel(Exercise.name)
    private exerciseModel: Model<ExerciseDocument>,
    private readonly uploadService: UploadService,
     private readonly uploadQueue: UploadQueueService, 
  ) {}
async create(dto: CreateExerciseDto, files?: Express.Multer.File[]) {
  const exercise = await this.exerciseModel.create({
    ...dto,
    images: [],
    uploadStatus: files?.length ? 'queued' : 'completed',
  });

  if (files?.length) {
    await this.uploadQueue.addUploadJob(
      exercise._id.toString(),
      files,
    );

    await this.exerciseModel.findByIdAndUpdate(exercise._id, {
      uploadStatus: 'queued',
    });
  }

  return {
    message: 'Exercise created successfully',
    data: {
      ...exercise.toObject(),
      uploadStatus: files?.length ? 'queued' : 'completed',
    },
  };
}

  async findAll(query: BuildQueryDto) {
    const baseQuery = this.exerciseModel.find().lean();

    const features = new ApiFeatures(baseQuery, query)
      .filter()
      .search(['title', 'description']);

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
    const exercise = await this.exerciseModel.findById(id).lean();

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return exercise;
  }

async update(
  id: string,
  dto: UpdateExerciseDto,
  files?: Express.Multer.File[],
) {
  const existing = await this.exerciseModel.findById(id).lean();

  if (!existing) {
    throw new NotFoundException('Exercise not found');
  }

  // 1. update data immediately
  const updated = await this.exerciseModel.findByIdAndUpdate(
    id,
    {
      ...dto,
      uploadStatus: files?.length ? 'queued' : existing.uploadStatus,
    },
    {
      runValidators: true,
      returnDocument: 'after',
    },
  );

  // 2. delegate upload to queue (NOT blocking)
  if (files?.length) {
    await this.uploadQueue.addUploadJob(id, files);
  }

  return {
    message: 'Exercise updated successfully',
    data: updated,
  };
}

  async remove(id: string) {
    const existing = await this.exerciseModel.findById(id).lean();

    if (!existing) {
      throw new NotFoundException('Exercise not found');
    }

    if (existing.images?.length) {
      await this.uploadService.deleteImages(existing.images);
    }

    await this.exerciseModel.findByIdAndDelete(id);

    return {
      message: 'Exercise deleted successfully',
    };
  }
}
