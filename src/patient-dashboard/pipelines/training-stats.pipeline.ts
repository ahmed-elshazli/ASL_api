import { PipelineStage, Types } from 'mongoose';
import { UserProgramStatus } from 'src/user-training-program/schemas/user-training-program.schema';
import { buildUserIdMatch } from 'src/common/utils/mongoose.util';

export function buildDashboardTrainingPipeline(
  userId: Types.ObjectId,
  exerciseCollection: string,
  startOfWeek: Date,
): PipelineStage[] {
  return [
    {
      $match: buildUserIdMatch(userId),
    },
    {
      $facet: {
        programStats: [
          {
            $group: {
              _id: null,
              activePrograms: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', UserProgramStatus.ACTIVE] },
                    1,
                    0,
                  ],
                },
              },
              completedPrograms: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', UserProgramStatus.COMPLETED] },
                    1,
                    0,
                  ],
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
              let: {
                exerciseId: '$completedExercises.exerciseId',
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$exerciseId'],
                    },
                  },
                },
                {
                  $project: {
                    calories: 1,
                  },
                },
              ],
              as: 'exercise',
            },
          },
          { $unwind: '$exercise' },
          {
            $group: {
              _id: null,
              completedExercises: {
                $sum: 1,
              },
              totalCaloriesBurned: {
                $sum: '$exercise.calories',
              },
            },
          },
        ],

        exerciseWeekly: [
          { $unwind: '$completedExercises' },
          {
            $match: {
              'completedExercises.completedAt': {
                $gte: startOfWeek,
              },
            },
          },
          {
            $lookup: {
              from: exerciseCollection,
              let: {
                exerciseId: '$completedExercises.exerciseId',
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$exerciseId'],
                    },
                  },
                },
                {
                  $project: {
                    calories: 1,
                  },
                },
              ],
              as: 'exercise',
            },
          },
          { $unwind: '$exercise' },
          {
            $group: {
              _id: {
                $dayOfWeek:
                  '$completedExercises.completedAt',
              },
              calories: {
                $sum: '$exercise.calories',
              },
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
}