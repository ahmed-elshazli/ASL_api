import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';

import {
  NutritionPlan,
  NutritionPlanDocument,
} from './schema/nutrition-plan.schema';

import { UpdateNutritionPlanDto } from './dto/update-plan.dto';
import { CreateNutritionPlanDto } from './dto/create-plan.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ApiFeatures } from 'src/common/utils/api-features';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(NutritionPlan.name)
    private readonly nutritionPlanModel: Model<NutritionPlanDocument>,
  ) {}

  // =========================
  // CREATE
  // =========================
  async create(
    dto: CreateNutritionPlanDto,
    createdBy: string,
  ): Promise<NutritionPlan> {
  

    const plan = await this.nutritionPlanModel.create({
      ...dto,
      createdBy: new Types.ObjectId(createdBy),
      patient: new Types.ObjectId(dto.patient),
    });

    return plan.toObject();
  }


 
  async findAll(query: BuildQueryDto) {
    const baseQuery = this.nutritionPlanModel.find().lean();

    const features = new ApiFeatures(baseQuery, query)
      .filter()
      .search(['name', 'type']);

  
      const total = await features.count();

    features.sort().limitFields().paginate(total);

    const data = await features.exec();

    return {
      results: data.length,
      pagination: features.paginationResult,
      data,
    };
  }

  
  async findByClient( patientId: string, query: BuildQueryDto) {
  

    const baseQuery = this.nutritionPlanModel
      .find({ patient: new Types.ObjectId(patientId) })
      .lean();

    const features = new ApiFeatures(baseQuery, query)
      .filter()
      .search(['name', 'type']);

    const total = await this.nutritionPlanModel.countDocuments({
      patient: new Types.ObjectId(patientId),
    });

    features.sort().limitFields().paginate(total);

    const data = await features.exec();

    return {
      results: data.length,
      pagination: features.paginationResult,
      data,
    };
  }


  async findOne(id: string): Promise<NutritionPlan> {
 

    const plan = await this.nutritionPlanModel.findById(id)
    .populate('createdBy', 'fullName ')
    .populate('patient', 'fullName phone email')
    .lean();

    if (!plan) {
      throw new NotFoundException('Nutrition plan not found');
    }

    return plan;
  }


  async update(
    id: string,
    dto: UpdateNutritionPlanDto,
  ): Promise<NutritionPlan> {
  

    const plan = await this.nutritionPlanModel
      .findByIdAndUpdate(id, dto, {
      returnDocument: 'after',
        runValidators: true,
      })
      .lean();

    if (!plan) {
      throw new NotFoundException('Nutrition plan not found');
    }

    return plan;
  }


  async remove(id: string): Promise<{ message: string }> {


    const plan = await this.nutritionPlanModel.findByIdAndDelete(id);

    if (!plan) {
      throw new NotFoundException('Nutrition plan not found');
    }

    return {
      message: 'Nutrition plan deleted successfully',
    };
  }
}