import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isoWeek from 'dayjs/plugin/weekOfYear';

dayjs.extend(relativeTime);
dayjs.extend(isoWeek);

/**
 * Formats a date to the given string format (default MM/DD/YYYY).
 */
export function formatDate(date: string | Date, formatStr = 'MM/DD/YYYY'): string {
  return dayjs(date).format(formatStr);
}

/**
 * Returns a human-readable relative time (e.g., "2 hours ago").
 */
export function formatTimeAgo(date: string | Date): string {
  return dayjs(date).fromNow();
}

/**
 * Returns the last N days in 'YYYY-MM-DD' format as an array.
 */
export function getLastNDays(count: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    dayjs().subtract(i, 'day').format('YYYY-MM-DD')
  ).reverse();
}

/**
 * Counts items by a date key derived from each item.
 */
export function countByDate<T>(items: T[], dateKeyFn: (item: T) => string): Record<string, number> {
  return items.reduce((acc: Record<string, number>, item) => {
    const key = dateKeyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Groups daily data into weekly summaries.
 */
export function groupIntoWeeklyData(
  data: { date: string; count: number }[],
  weekSize = 7
): { week: string; count: number }[] {
  const result: { week: string; count: number }[] = [];
  for (let i = 0; i < data.length; i += weekSize) {
    const slice = data.slice(i, i + weekSize);
    const total = slice.reduce((sum, day) => sum + day.count, 0);
    if (slice.length > 0) {
      const start = dayjs(slice[0].date).format('M/D');
      const end = dayjs(slice[slice.length - 1].date).format('M/D');
      result.push({ week: `${start} - ${end}`, count: total });
    }
  }
  return result;
}

/**
 * Formats a date to ISO date string 'YYYY-MM-DD'.
 */
export function formatIsoDate(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * Checks if two dates are in the same month and year.
 */
export function isSameMonth(
  date: string | Date,
  compareTo: string | Date = new Date()
): boolean {
  return dayjs(date).isSame(dayjs(compareTo), 'month');
}

/**
 * Returns the difference in days between two dates (dateA - dateB).
 */
export function daysDiff(
  dateA: string | Date,
  dateB: string | Date
): number {
  return dayjs(dateA).diff(dayjs(dateB), 'day');
}
