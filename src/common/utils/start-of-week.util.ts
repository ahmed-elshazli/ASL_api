export function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun ... 6 = Sat
  const diffFromSaturday = (day + 1) % 7;

  const start = new Date(now);
  start.setDate(now.getDate() - diffFromSaturday);
  start.setHours(0, 0, 0, 0);

  return start;
}