export interface ProgramStatsFacet {
  activePrograms: number;
  completedPrograms: number;
}

export interface ExerciseTotalsFacet {
  completedExercises: number;
  totalCaloriesBurned: number;
}

export interface ExerciseWeeklyFacet {
  dayOfWeek: number;
  calories: number;
}

export interface TrainingAggregationResult {
  programStats: ProgramStatsFacet[];
  exerciseTotals: ExerciseTotalsFacet[];
  exerciseWeekly: ExerciseWeeklyFacet[];
}