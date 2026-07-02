import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { WeightLog, WeightLogDocument } from './schemas/weight-log.schema';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';

@Injectable()
export class WeightLogService {
  constructor(
    @InjectModel(WeightLog.name)
    private readonly weightLogModel: Model<WeightLogDocument>,
  ) {}

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }

    return new Types.ObjectId(id);
  }

  async create(userId: string, weight: number): Promise<WeightLogDocument> {
    return await this.weightLogModel.create({
      userId: this.toObjectId(userId),
      weight,
    });
  }

  async getWeightHistory(userId: string) {
    const logs = await this.weightLogModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .lean();

    return logs;
  }

  async getLatestWeight(userId: string) {
    
    return this.weightLogModel
      .findOne({
        userId: this.toObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getInitialWeight(userId: string) {
    return this.weightLogModel
      .findOne({
        userId: this.toObjectId(userId),
      })
      .sort({ createdAt: 1 })
      .lean();
  }

  async getWeightStatistics(userId: string) {
    const [firstWeight, latestWeight] = await Promise.all([
      this.getInitialWeight(userId),
      this.getLatestWeight(userId),
    ]);

    if (!firstWeight || !latestWeight) {
      return {
        initialWeight: null,
        currentWeight: null,
        weightLost: 0,
      };
    }

    return {
      initialWeight: firstWeight.weight,
      currentWeight: latestWeight.weight,
      weightLost: Number(firstWeight.weight) - Number(latestWeight.weight),
    };
  }
}
