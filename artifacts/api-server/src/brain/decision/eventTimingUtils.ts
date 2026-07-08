/**
 * Event timing utilities — pure date math for DecisionContext assembly.
 *
 * Used by buildDecisionContext() only. Does not influence normalization or signals.
 * Uses UTC calendar days so ISO generatedAt values are deterministic.
 */

const MS_PER_DAY = 86_400_000;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseMonthDay(dateStr: string): { month: number; day: number } | null {
  const parts = dateStr.split("-");
  let month: number;
  let day: number;

  if (parts.length === 3) {
    month = parseInt(parts[1]!, 10) - 1;
    day = parseInt(parts[2]!, 10);
  } else if (parts.length === 2) {
    month = parseInt(parts[0]!, 10) - 1;
    day = parseInt(parts[1]!, 10);
  } else {
    return null;
  }

  if (isNaN(month) || isNaN(day)) return null;
  return { month, day };
}

/**
 * Days until the next calendar occurrence of a month/day date from referenceDate.
 */
export function daysUntilNextOccurrence(
  dateStr: string | null | undefined,
  referenceDate: Date,
): number | null {
  if (!dateStr) return null;

  const monthDay = parseMonthDay(dateStr);
  if (!monthDay) return null;

  const today = startOfUtcDay(referenceDate);
  const year = today.getUTCFullYear();
  let next = new Date(Date.UTC(year, monthDay.month, monthDay.day));
  if (next < today) {
    next = new Date(Date.UTC(year + 1, monthDay.month, monthDay.day));
  }

  return Math.ceil((next.getTime() - today.getTime()) / MS_PER_DAY);
}

export function computeBirthdayDaysAway(
  birthday: string | null | undefined,
  generatedAt: string,
): number | null {
  return daysUntilNextOccurrence(birthday, new Date(generatedAt));
}
