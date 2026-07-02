export const WEEKDAY_LABELS = [
  'Sat',
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
] as const;

export type WeekdayLabel = (typeof WEEKDAY_LABELS)[number];

export const MONGO_DOW_TO_LABEL: Record<number, WeekdayLabel> = {
  1: 'Sun',
  2: 'Mon',
  3: 'Tue',
  4: 'Wed',
  5: 'Thu',
  6: 'Fri',
  7: 'Sat',
};