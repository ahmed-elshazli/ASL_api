import {
  RawWeightLog,
  WeeklyWeightPoint,
} from '../interfaces/weight-progress.interface';

export function sortWeightHistoryAscending(
  logs: RawWeightLog[],
): RawWeightLog[] {
  return [...logs].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime(),
  );
}

export function buildWeeklyWeightProgress(
  logs: RawWeightLog[],
): WeeklyWeightPoint[] {
  if (logs.length === 0) {
    return [];
  }

  const initialWeight = logs[0].weight;
  const buckets = new Map<string, RawWeightLog>();

  for (const log of logs) {
    const date = new Date(log.createdAt);
    const { isoYear, isoWeek } = getIsoWeek(date);
    const key = `${isoYear}-${isoWeek}`;

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
        changeFromInitial:
          Number(log.weight) - Number(initialWeight),
      };
    })
    .sort(
      (a, b) =>
        a.isoYear - b.isoYear ||
        a.isoWeek - b.isoWeek,
    );
}

export function getIsoWeek(
  date: Date,
): { isoYear: number; isoWeek: number } {
  const target = new Date(date.getTime());
  target.setHours(0, 0, 0, 0);

  const dayNumber =
    target.getDay() === 0 ? 7 : target.getDay();

  target.setDate(target.getDate() + 4 - dayNumber);

  const isoYear = target.getFullYear();

  const yearStart = new Date(isoYear, 0, 1);

  const isoWeek = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86400000 + 1) /
      7,
  );

  return {
    isoYear,
    isoWeek,
  };
}