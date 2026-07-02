import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';

import { User, UserDocument } from 'src/users/schema/users.schema';
import {
  UserTrainingProgram,
  UserTrainingProgramDocument,
  UserProgramStatus,
} from 'src/user-training-program/schemas/user-training-program.schema';
import { Exercise } from 'src/exercises/schemas/exercise.schema';
import { WeightLogService } from 'src/weight-log/weight-log.service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
type WeekdayLabel = (typeof WEEKDAY_LABELS)[number];

// Mongo $dayOfWeek returns 1 (Sun) .. 7 (Sat). Map that to our Sat-first week.
const MONGO_DOW_TO_LABEL: Record<number, WeekdayLabel> = {
  1: 'Sun',
  2: 'Mon',
  3: 'Tue',
  4: 'Wed',
  5: 'Thu',
  6: 'Fri',
  7: 'Sat',
};

interface ProgramStatsFacet {
  activePrograms: number;
  completedPrograms: number;
}

interface ExerciseTotalsFacet {
  completedExercises: number;
  totalCaloriesBurned: number;
}

interface ExerciseWeeklyFacet {
  dayOfWeek: number;
  calories: number;
}

interface TrainingAggregationResult {
  programStats: ProgramStatsFacet[];
  exerciseTotals: ExerciseTotalsFacet[];
  exerciseWeekly: ExerciseWeeklyFacet[];
}

interface RawWeightLog {
  weight: number;
  createdAt: Date;
}

export interface WeeklyWeightPoint {
  isoYear: number;
  isoWeek: number;
  date: string;
  weight: number;
  changeFromInitial: number;
}

export interface PatientDashboardResponse {
  overview: {
    currentWeight: number;
    weightLost: number;
    weightChange: number;
    minWeight: number;
    maxWeight: number;
    activePrograms: number;
    completedPrograms: number;
    completedExercises: number;
    totalCaloriesBurned: number;
  };
  weightProgress: { date: string; weight: number; changeFromInitial: number }[];
  weeklyWeightProgress: WeeklyWeightPoint[];
  weeklyCaloriesBurned: { day: WeekdayLabel; calories: number }[];
  meta: {
    hasWeightTracking: boolean;
    hasTrainingData: boolean;
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class PatientDashboardService {
  private readonly logger = new Logger(PatientDashboardService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(UserTrainingProgram.name)
    private readonly userProgramModel: Model<UserTrainingProgramDocument>,

    // WeightLogService is used only for its existing, untouched methods
    // (getWeightHistory). All chart-shaping logic (sorting, sign fixes,
    // weekly bucketing) is done here on purpose, so weight-log.service.ts
    // never needs to change.
    private readonly weightLogService: WeightLogService,
  ) {}

  async getDashboard(userId: string): Promise<PatientDashboardResponse> {
    const objectId = this.toObjectId(userId);

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

    // getWeightHistory does not guarantee order, so every chart-related
    // calculation below starts from an explicitly sorted copy.
    const weightHistory = this.sortWeightHistoryAscending(rawWeightHistory);

    return this.buildResponse(user.weight, trainingStats, weightHistory);
  }

  // -------------------------------------------------------------------------
  // Training / exercise aggregation
  // -------------------------------------------------------------------------

  private async getTrainingStats(userId: Types.ObjectId) {
    const startOfWeek = this.getStartOfWeek();
    const exerciseCollection = this.userProgramModel.db.collection(
      this.userProgramModel.db.model(Exercise.name).collection.name,
    ).collectionName;

    const pipeline: PipelineStage[] = [
      // Some UserTrainingProgram documents have userId stored as a raw
      // String instead of ObjectId (legacy data inconsistency, confirmed
      // via debug logs). Matching both forms keeps this query correct
      // regardless of how a given document was written.
      { $match: this.buildUserIdMatch(userId) },
      {
        $facet: {
          programStats: [
            {
              $group: {
                _id: null,
                activePrograms: {
                  $sum: {
                    $cond: [{ $eq: ['$status', UserProgramStatus.ACTIVE] }, 1, 0],
                  },
                },
                completedPrograms: {
                  $sum: {
                    $cond: [{ $eq: ['$status', UserProgramStatus.COMPLETED] }, 1, 0],
                  },
                },
              },
            },
          ],

          exerciseTotals: [
            { $unwind: '$completedExercises' },
            {
              $lookup: {
                from: exerciseCollection,
                let: { exerciseId: '$completedExercises.exerciseId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$exerciseId'] } } },
                  { $project: { calories: 1 } },
                ],
                as: 'exercise',
              },
            },
            { $unwind: '$exercise' },
            {
              $group: {
                _id: null,
                completedExercises: { $sum: 1 },
                totalCaloriesBurned: { $sum: '$exercise.calories' },
              },
            },
          ],

          exerciseWeekly: [
            { $unwind: '$completedExercises' },
            {
              $match: {
                'completedExercises.completedAt': { $gte: startOfWeek },
              },
            },
            {
              $lookup: {
                from: exerciseCollection,
                let: { exerciseId: '$completedExercises.exerciseId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$exerciseId'] } } },
                  { $project: { calories: 1 } },
                ],
                as: 'exercise',
              },
            },
            { $unwind: '$exercise' },
            {
              $group: {
                _id: { $dayOfWeek: '$completedExercises.completedAt' },
                calories: { $sum: '$exercise.calories' },
              },
            },
            {
              $project: {
                _id: 0,
                dayOfWeek: '$_id',
                calories: 1,
              },
            },
          ],
        },
      },
    ];

    const [result] = await this.userProgramModel.aggregate<TrainingAggregationResult>(
      pipeline,
    );

    const programStats = result?.programStats?.[0] ?? {
      activePrograms: 0,
      completedPrograms: 0,
    };

    if (programStats.activePrograms === 0 && programStats.completedPrograms === 0) {
      this.logger.debug(
        `No UserTrainingProgram documents matched userId=${userId.toString()} (checked both ObjectId and string form).`,
      );
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

  // -------------------------------------------------------------------------
  // Weight chart shaping — all done here, on data from the untouched
  // WeightLogService.getWeightHistory().
  // -------------------------------------------------------------------------

  private sortWeightHistoryAscending(logs: RawWeightLog[]): RawWeightLog[] {
    return [...logs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  /**
   * One point per ISO week (the last log within that week), each expressed
   * as the change from the very first recorded weight. `logs` must already
   * be sorted ascending by date.
   */
  private buildWeeklyWeightProgress(logs: RawWeightLog[]): WeeklyWeightPoint[] {
    if (logs.length === 0) {
      return [];
    }

    const initialWeight = logs[0].weight;
    const buckets = new Map<string, RawWeightLog>();

    for (const log of logs) {
      const date = new Date(log.createdAt);
      const { isoYear, isoWeek } = this.getIsoWeek(date);
      const key = `${isoYear}-${isoWeek}`;
      // Later entries overwrite earlier ones within the same week, since
      // logs is sorted ascending — this naturally keeps the last log
      // of each week.
      buckets.set(key, log);
    }

    return Array.from(buckets.entries())
      .map(([key, log]) => {
        const [isoYear, isoWeek] = key.split('-').map(Number);
        return {
          isoYear,
          isoWeek,
          date: new Date(log.createdAt).toISOString().slice(0, 10),
          weight: log.weight,
          changeFromInitial: Number(log.weight) - Number(initialWeight),
        };
      })
      .sort((a, b) => (a.isoYear - b.isoYear) || (a.isoWeek - b.isoWeek));
  }

  private getIsoWeek(date: Date): { isoYear: number; isoWeek: number } {
    // Standard ISO-8601 week calculation.
    const target = new Date(date.getTime());
    target.setHours(0, 0, 0, 0);
    // ISO week starts on Monday; shift so Sunday(0) becomes 7.
    const dayNumber = target.getDay() === 0 ? 7 : target.getDay();
    target.setDate(target.getDate() + 4 - dayNumber);

    const isoYear = target.getFullYear();
    const yearStart = new Date(isoYear, 0, 1);
    const isoWeek = Math.ceil(
      ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );

    return { isoYear, isoWeek };
  }

  // -------------------------------------------------------------------------
  // Response builder
  // -------------------------------------------------------------------------

  private buildResponse(
    fallbackWeight: number,
    training: Awaited<ReturnType<PatientDashboardService['getTrainingStats']>>,
    weightHistory: RawWeightLog[],
  ): PatientDashboardResponse {
    const hasWeightTracking = weightHistory.length > 0;

    const initialWeight = hasWeightTracking ? weightHistory[0].weight : fallbackWeight;
    const currentWeight = hasWeightTracking
      ? weightHistory[weightHistory.length - 1].weight
      : fallbackWeight;

    // weightChange: negative = lost weight, positive = gained weight.
    const weightChange = hasWeightTracking
      ? Number(currentWeight) - Number(initialWeight)
      : 0;


    const weightLost = Math.max(-weightChange, 0);

    const weights = weightHistory.map((log) => log.weight);
    const minWeight = weights.length ? Math.min(...weights) : fallbackWeight;
    const maxWeight = weights.length ? Math.max(...weights) : fallbackWeight;

    const weightProgress = weightHistory.map((log) => ({
      date: new Date(log.createdAt).toISOString().slice(0, 10),
      weight: log.weight,
      changeFromInitial: Number(log.weight) - Number(initialWeight),
    }));

    return {
      overview: {
        currentWeight,
        weightLost,
        weightChange,
        minWeight,
        maxWeight,
        activePrograms: training.programStats.activePrograms,
        completedPrograms: training.programStats.completedPrograms,
        completedExercises: training.exerciseTotals.completedExercises,
        totalCaloriesBurned: training.exerciseTotals.totalCaloriesBurned,
      },
      weightProgress,
      weeklyWeightProgress: this.buildWeeklyWeightProgress(weightHistory),
      weeklyCaloriesBurned: this.buildWeeklyCalories(training.exerciseWeekly),
      meta: {
        hasWeightTracking,
        hasTrainingData: training.programStats.activePrograms > 0,
      },
    };
  }

  private buildWeeklyCalories(
    weekly: ExerciseWeeklyFacet[],
  ): { day: WeekdayLabel; calories: number }[] {
    const caloriesByLabel = new Map<WeekdayLabel, number>(
      WEEKDAY_LABELS.map((label) => [label, 0]),
    );

    for (const entry of weekly) {
      const label = MONGO_DOW_TO_LABEL[entry.dayOfWeek];
      if (label) {
        caloriesByLabel.set(label, entry.calories);
      }
    }

    return WEEKDAY_LABELS.map((day) => ({
      day,
      calories: caloriesByLabel.get(day) ?? 0,
    }));
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private getStartOfWeek(): Date {
    // Week starts on Saturday, matching WEEKDAY_LABELS ordering.
    const now = new Date();
    const day = now.getDay(); // 0 = Sun ... 6 = Sat
    const diffFromSaturday = (day + 1) % 7;

    const start = new Date(now);
    start.setDate(now.getDate() - diffFromSaturday);
    start.setHours(0, 0, 0, 0);

    return start;
  }

  private buildUserIdMatch(
    userId: Types.ObjectId,
  ): { $or: [{ userId: Types.ObjectId }, { userId: string }] } {
    return {
      $or: [{ userId }, { userId: userId.toString() }],
    };
  }

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }
    return new Types.ObjectId(id);
  }
}