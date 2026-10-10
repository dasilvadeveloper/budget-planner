import { DateTime } from 'luxon';

/**
 * Parses a strict `YYYY-MM-DD` date string into a Luxon DateTime.
 * Returns null for empty, malformed, or non-date-only values (e.g. full timestamps) —
 * the round-trip through toISODate() rejects anything that isn't exactly a plain date.
 */
export function parseIsoDate(value: string | null | undefined): DateTime | null {
  if (!value) return null;
  const parsed = DateTime.fromISO(value);
  return parsed.isValid && parsed.toISODate() === value ? parsed : null;
}

/** Converts a Luxon DateTime back into a `YYYY-MM-DD` string. */
export function toIsoDateString(date: DateTime | null): string {
  return date?.toISODate() ?? '';
}

/** True only for a strict `YYYY-MM-DD` date string — rejects full timestamps and other formats. */
export function isValidIsoDateString(value: string | null): value is string {
  return parseIsoDate(value) !== null;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

/** The current calendar month as a `DateRange`, used as the default period filter. */
export function currentMonthRange(): DateRange {
  const now = DateTime.now();
  return {
    startDate: now.startOf('month').toISODate() ?? '',
    endDate: now.endOf('month').toISODate() ?? '',
  };
}
