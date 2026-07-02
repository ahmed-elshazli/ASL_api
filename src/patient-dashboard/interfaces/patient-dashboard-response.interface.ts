import { WeeklyWeightPoint } from "./weight-progress.interface";

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

  weightProgress: {
    date: string;
    weight: number;
    changeFromInitial: number;
  }[];

  weeklyWeightProgress: WeeklyWeightPoint[];

  weeklyCaloriesBurned: {
    day: 'Sat' | 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
    calories: number;
  }[];

  meta: {
    hasWeightTracking: boolean;
    hasTrainingData: boolean;
  };
}