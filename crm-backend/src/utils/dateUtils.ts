/**
 * Date utility functions for report generation and date handling
 */

/**
 * Get start and end dates based on a period string
 * @param period Period string (today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth, last30days, last90days, custom)
 * @param customStartDate Optional custom start date for 'custom' period
 * @param customEndDate Optional custom end date for 'custom' period
 */
export function getDateRangeFromPeriod(
  period: string,
  customStartDate?: string,
  customEndDate?: string
): { startDate: Date; endDate: Date } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date(now.setHours(23, 59, 59, 999));

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;

    case 'yesterday':
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      
      startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'thisWeek':
      startDate = new Date(now);
      // Set to Monday of current week
      startDate.setDate(startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1));
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'lastWeek':
      startDate = new Date(now);
      // Set to Monday of last week
      startDate.setDate(startDate.getDate() - startDate.getDay() - 6);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;

    case 'last30days':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'last90days':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'custom':
      if (!customStartDate || !customEndDate) {
        throw new Error('Custom date range requires both start and end dates');
      }
      startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      // Default to last 30 days
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
}

/**
 * Format a date range as a human-readable string
 * @param startDate Start date
 * @param endDate End date
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const formatOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };

  const startFormatted = startDate.toLocaleDateString('en-US', formatOptions);
  const endFormatted = endDate.toLocaleDateString('en-US', formatOptions);

  if (startFormatted === endFormatted) {
    return startFormatted;
  }

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Calculate the difference between two dates in days
 * @param startDate Start date
 * @param endDate End date
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const differenceMs = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.floor(differenceMs / millisecondsPerDay);
}

/**
 * Get an array of dates between start and end dates (inclusive)
 * @param startDate Start date
 * @param endDate End date
 */
export function getDatesBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Format a date as YYYY-MM-DD
 * @param date Date to format
 */
export function formatYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if a date is today
 * @param date Date to check
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Group dates by month
 * @param dates Array of dates
 * @returns Object with keys in format 'YYYY-MM' and arrays of dates as values
 */
export function groupDatesByMonth(dates: Date[]): Record<string, Date[]> {
  return dates.reduce((groups: Record<string, Date[]>, date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(date);
    return groups;
  }, {});
}

/**
 * Get month name from date
 * @param date Date object
 */
export function getMonthName(date: Date): string {
  return date.toLocaleString('en-US', { month: 'long' });
} 