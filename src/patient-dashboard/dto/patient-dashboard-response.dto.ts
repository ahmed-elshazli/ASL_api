export class PatientDashboardResponseDto {
  currentWeight: number;

  weightLost: number;

  completedPrograms: number;

  completedExercises: number;

  totalCaloriesBurned: number;

  weightProgress: {
    date: Date;
    weight: number;
  }[];

  weeklyCaloriesBurned: {
    day: string;
    calories: number;
  }[];
}