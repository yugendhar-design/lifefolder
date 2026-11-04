import { differenceInCalendarDays, isToday, parseISO, format, startOfDay } from 'date-fns';
import { DeadlineStatus } from '../types';

/**
 * Calculates deadline status dynamically using user's local date
 * Rules:
 * - Overdue: deadline before today
 * - Due today: deadline is today
 * - Approaching: deadline is within the next 30 days (1 to 30 days)
 * - Upcoming: deadline is more than 30 days away
 */
export function getDeadlineStatus(dateString: string): DeadlineStatus {
  if (!dateString) return 'Upcoming';
  
  const today = startOfDay(new Date());
  const deadline = startOfDay(parseISO(dateString));

  if (isToday(deadline)) {
    return 'Due today';
  }

  const diffDays = differenceInCalendarDays(deadline, today);

  if (diffDays < 0) {
    return 'Overdue';
  } else if (diffDays <= 30) {
    return 'Approaching';
  } else {
    return 'Upcoming';
  }
}

/**
 * Human-friendly difference label (e.g. "6 days ago", "Due today", "In 15 days")
 */
export function getRelativeTimeText(dateString: string): string {
  if (!dateString) return '';
  const today = startOfDay(new Date());
  const deadline = startOfDay(parseISO(dateString));
  const diff = differenceInCalendarDays(deadline, today);

  if (diff === 0) return 'Due today';
  if (diff < 0) {
    const daysPast = Math.abs(diff);
    return `${daysPast} ${daysPast === 1 ? 'day' : 'days'} ago`;
  }
  return `In ${diff} ${diff === 1 ? 'day' : 'days'}`;
}

export function formatDisplayDate(dateString: string): string {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}
