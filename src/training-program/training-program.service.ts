import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { UpdateTrainingProgramDto } from './dto/update-training-program.dto';
import {
  TrainingProgram,
  TrainingProgramDocument,
} from './schemas/training-program.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ApiFeatures } from 'src/common/utils/api-features';
@Injectable()
export class TrainingProgramService {
  constructor(
    @InjectModel(TrainingProgram.name)
    private readonly trainingProgramModel: Model<TrainingProgramDocument>,
  ) {}

  async create(createDto: CreateTrainingProgramDto) {
    this.validateCaloriesRange(createDto.minCalories, createDto.maxCalories);

    const program = await this.trainingProgramModel.create(createDto);

    return {
      message: 'Training program created successfully',
      data: program,
    };
  }

  async findAll(query: BuildQueryDto) {
    const baseQuery = this.trainingProgramModel.find().lean();

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
    const program = await this.trainingProgramModel
      .findById(id)
      .populate('exercises.exerciseId') 
      .lean();

    if (!program) {
      throw new BadRequestException('Training program not found');
    }

    return program;
  }

  async update(id: string, updateDto: UpdateTrainingProgramDto) {
    if (
      updateDto.minCalories !== undefined ||
      updateDto.maxCalories !== undefined
    ) {
      const existing = await this.trainingProgramModel
        .findById(id)
        .select('minCalories maxCalories')
        .lean();

      if (!existing) {
        throw new BadRequestException('Training program not found');
      }

      const min = updateDto.minCalories ?? existing.minCalories;
      const max = updateDto.maxCalories ?? existing.maxCalories;

      this.validateCaloriesRange(min, max);
    }

    const program = await this.trainingProgramModel
      .findByIdAndUpdate(id, updateDto, {
        returnDocument: 'after',
        runValidators: true,
      })
      .lean();

    if (!program) {
      throw new BadRequestException('Training program not found');
    }

    return {
      message: 'Training program updated successfully',
      data: program,
    };
  }

  async remove(id: string) {
    const program = await this.trainingProgramModel
      .findByIdAndDelete(id)
      .lean();

    if (!program) {
      throw new BadRequestException('Training program not found');
    }

    return {
      message: 'Training program deleted successfully',
    };
  }

  private validateCaloriesRange(min: number, max: number) {
    if (min > max) {
      throw new BadRequestException(
        'minCalories cannot be greater than maxCalories',
      );
    }
  }
}