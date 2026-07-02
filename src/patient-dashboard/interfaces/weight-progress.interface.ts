export interface RawWeightLog {
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