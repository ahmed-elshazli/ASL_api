import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { WeightLog } from './schemas/weight-log.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class WeightLogService {
  constructor(
    @InjectModel(WeightLog.name)
    private readonly weightLogModel: Model<WeightLog>,
  ) {}

  async create(userId: string, weight:number): Promise<WeightLog> {
    return await this.weightLogModel.create({
      userId,
      weight,
    });
  }

  async getWeightHistory(
  userId: string,
) {
  return await this.weightLogModel
    .find({
      userId: new Types.ObjectId(userId),
    })
    .sort({ createdAt: 1 })
    .select('weight createdAt')
    .lean();
}


async getLatestWeight(
  userId: string,
) {
  return await this.weightLogModel
    .findOne({
      userId: new Types.ObjectId(userId),
    })
    .sort({ createdAt: -1 })
    .lean();
}

async getInitialWeight(
  userId: string,
) {
  return await this.weightLogModel
    .findOne({
      userId: new Types.ObjectId(userId),
    })
    .sort({ createdAt: 1 })
    .lean();
}

async getWeightStatistics(
  userId: string,
) {
  const [firstWeight, latestWeight] =
    await Promise.all([
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
    weightLost:
      firstWeight.weight - latestWeight.weight,
  };
}
}
