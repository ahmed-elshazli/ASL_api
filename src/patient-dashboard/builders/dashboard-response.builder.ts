import { PatientDashboardResponse } from '../interfaces/patient-dashboard-response.interface';
import { RawWeightLog } from '../interfaces/weight-progress.interface';
import { ExerciseWeeklyFacet } from '../interfaces/training-aggregation.interface';
import {
  WEEKDAY_LABELS,
  WeekdayLabel,
  MONGO_DOW_TO_LABEL,
} from '../constants/weekday.constants';
import { buildWeeklyWeightProgress } from './weight-progress.builder';

export function buildResponse(
  fallbackWeight: number,
  training: any,
  weightHistory: RawWeightLog[],
): PatientDashboardResponse {
  const hasWeightTracking = weightHistory.length > 0;

  const initialWeight = hasWeightTracking
    ? weightHistory[0].weight
    : fallbackWeight;

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
    weeklyWeightProgress: buildWeeklyWeightProgress(weightHistory),
    weeklyCaloriesBurned: buildWeeklyCalories(training.exerciseWeekly),
    meta: {
      hasWeightTracking,
      hasTrainingData: training.programStats.activePrograms > 0,
    },
  };
}

export function buildWeeklyCalories(
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