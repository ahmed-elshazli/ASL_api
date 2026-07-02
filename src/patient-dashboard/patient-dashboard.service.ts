import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from 'src/users/schema/users.schema';
import {
  UserTrainingProgram,
  UserTrainingProgramDocument,
} from 'src/user-training-program/schemas/user-training-program.schema';
import { Exercise } from 'src/exercises/schemas/exercise.schema';
import { WeightLogService } from 'src/weight-log/weight-log.service';
import { PatientDashboardResponse } from './interfaces/patient-dashboard-response.interface';

import { TrainingAggregationResult } from './interfaces/training-aggregation.interface';

import { toObjectId } from 'src/common/utils/mongoose.util';
import { getStartOfWeek } from 'src/common/utils/start-of-week.util';
import { buildDashboardTrainingPipeline } from './pipelines/training-stats.pipeline';
import { sortWeightHistoryAscending } from './builders/weight-progress.builder';
import { buildResponse } from './builders/dashboard-response.builder';

@Injectable()
export class PatientDashboardService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(UserTrainingProgram.name)
    private readonly userProgramModel: Model<UserTrainingProgramDocument>,

    private readonly weightLogService: WeightLogService,
  ) {}

  async getDashboard(userId: string): Promise<PatientDashboardResponse> {
    const objectId = toObjectId(userId);

    const user = await this.userModel
      .findById(objectId)
      .select({ weight: 1 })
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [trainingStats, rawWeightHistory] = await Promise.all([
      this.getTrainingStats(objectId),
      this.weightLogService.getWeightHistory(userId),
    ]);

    const weightHistory = sortWeightHistoryAscending(rawWeightHistory);

    return buildResponse(user.weight, trainingStats, weightHistory);
  }

  private async getTrainingStats(userId: Types.ObjectId) {
    const startOfWeek = getStartOfWeek();
    const exerciseCollection = this.userProgramModel.db.collection(
      this.userProgramModel.db.model(Exercise.name).collection.name,
    ).collectionName;

    const pipeline = buildDashboardTrainingPipeline(
      userId,
      exerciseCollection,
      startOfWeek,
    );

    const [result] =
      await this.userProgramModel.aggregate<TrainingAggregationResult>(
        pipeline,
      );

    const programStats = result?.programStats?.[0] ?? {
      activePrograms: 0,
      completedPrograms: 0,
    };

    if (
      programStats.activePrograms === 0 &&
      programStats.completedPrograms === 0
    ) {
    
    }

    return {
      programStats,
      exerciseTotals: result?.exerciseTotals?.[0] ?? {
        completedExercises: 0,
        totalCaloriesBurned: 0,
      },
      exerciseWeekly: result?.exerciseWeekly ?? [],
    };
  }
}
