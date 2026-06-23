import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from 'src/users/schema/users.schema';
import {
  Exercise,
  ExerciseDocument,
} from 'src/exercises/schemas/exercise.schema';
import {
  UserTrainingProgram,
  UserTrainingProgramDocument,
} from 'src/user-training-program/schemas/user-training-program.schema';
import { WeightLogService } from 'src/weight-log/weight-log.service';

const WEEKDAY_ORDER = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

@Injectable()
export class PatientDashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserTrainingProgram.name)
    private userProgramModel: Model<UserTrainingProgramDocument>,
    @InjectModel(Exercise.name)
    private exerciseModel: Model<ExerciseDocument>,
    private readonly weightLogService: WeightLogService,
  ) {}

  // =========================
  // DASHBOARD ENTRY
  // =========================
  async getDashboard(userId: string) {
    const userObjectId = this.safeObjectId(userId);

    const user = await this.userModel.findById(userObjectId).lean();
    if (!user) throw new NotFoundException('User not found');

    const [mainData, weightHistory, weightStats] = await Promise.all([
      this.getMainDashboardData(userObjectId),
      this.weightLogService.getWeightHistory(userId),
      this.weightLogService.getWeightStatistics(userId),
    ]);

    const weightProgress = (weightHistory || []).map((log) => ({
      date: log.createdAt
        ? new Date(log.createdAt).toISOString().split('T')[0]
        : null,
      weight: log.weight ?? 0,
    }));

    const weights = weightProgress.map((w) => w.weight);

    const currentWeight =
      weightStats?.currentWeight ??
      user.weight ??
      weights[weights.length - 1] ??
      0;

    const minWeight = weights.length ? Math.min(...weights) : 0;
    const maxWeight = weights.length ? Math.max(...weights) : 0;

    const weightLost = weightStats?.weightLost ?? 0;

    return {
      overview: {
        currentWeight,
        weightLost,
        minWeight,
        maxWeight,
        activePrograms: mainData.overview.activePrograms,
        completedPrograms: mainData.overview.completedPrograms,
        completedExercises: mainData.overview.completedExercises,
        totalCaloriesBurned: mainData.overview.totalCaloriesBurned,
      },

      weightProgress,
      weeklyCaloriesBurned: mainData.weeklyCalories,

      meta: {
        hasWeightTracking: weightProgress.length > 0,
        hasTrainingData: mainData.overview.activePrograms > 0,
      },
    };
  }

  // =========================
  // AGGREGATION
  // =========================
  async getMainDashboardData(userId: Types.ObjectId) {
    const [result] = await this.userProgramModel.aggregate([
      { $match: { userId } },

      {
        $facet: {
          programStats: [
            {
              $group: {
                _id: null,
                activePrograms: {
                  $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
                },
                completedPrograms: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                },
              },
            },
          ],

          exerciseStats: [
            { $unwind: '$completedExercises' },

            {
              $lookup: {
                from: 'exercises',
                localField: 'completedExercises.exerciseId',
                foreignField: '_id',
                as: 'exercise',
              },
            },

            { $unwind: { path: '$exercise', preserveNullAndEmptyArrays: true } },

            {
              $group: {
                _id: null,
                totalCaloriesBurned: {
                  $sum: { $ifNull: ['$exercise.calories', 0] },
                },
                completedExercises: { $sum: 1 },
                weeklyRaw: {
                  $push: {
                    calories: { $ifNull: ['$exercise.calories', 0] },
                    date: '$completedExercises.completedAt',
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    const programStats = result?.programStats?.[0] ?? {
      activePrograms: 0,
      completedPrograms: 0,
    };

    const exerciseStats = result?.exerciseStats?.[0] ?? {
      totalCaloriesBurned: 0,
      completedExercises: 0,
      weeklyRaw: [],
    };

    return {
      overview: {
        activePrograms: programStats.activePrograms,
        completedPrograms: programStats.completedPrograms,
        completedExercises: exerciseStats.completedExercises,
        totalCaloriesBurned: exerciseStats.totalCaloriesBurned,
      },
      weeklyCalories: this.buildWeeklyCalories(exerciseStats.weeklyRaw),
    };
  }

  // =========================
  // WEEKLY CALORIES
  // =========================
  private buildWeeklyCalories(
    weeklyRaw: { calories: number; date: Date | string | null }[],
  ) {
    const startOfWeek = this.getStartOfWeek(new Date());

    const map = new Map(WEEKDAY_ORDER.map((d) => [d, 0]));

    for (const item of weeklyRaw || []) {
      if (!item?.date) continue;

      const date = new Date(item.date);
      if (isNaN(date.getTime())) continue;

      if (date < startOfWeek) continue;

      const day = WEEKDAY_ORDER[date.getDay() === 0 ? 1 : date.getDay() - 1];

      if (map.has(day)) {
        map.set(day, map.get(day)! + (item.calories || 0));
      }
    }

    return WEEKDAY_ORDER.map((day) => ({
      day,
      calories: map.get(day) || 0,
    }));
  }

  // =========================
  // START OF WEEK
  // =========================
  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 1) % 7;

    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);

    return d;
  }

  // =========================
  // SAFE OBJECT ID HANDLER
  // =========================
  private safeObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }
    return new Types.ObjectId(id);
  }
}