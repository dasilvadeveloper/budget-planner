import { DateTime } from 'luxon';
import { currentMonthRange, isValidIsoDateString, parseIsoDate, toIsoDateString } from './date-util';

describe('parseIsoDate', () => {
  it('parses a valid plain ISO date', () => {
    const result = parseIsoDate('2026-09-10');
    expect(result?.toISODate()).toBe('2026-09-10');
  });

  it('returns null for empty/undefined/null input', () => {
    expect(parseIsoDate('')).toBeNull();
    expect(parseIsoDate(null)).toBeNull();
    expect(parseIsoDate(undefined)).toBeNull();
  });

  it('returns null for a malformed non-empty string', () => {
    expect(parseIsoDate('not-a-date')).toBeNull();
  });

  it('rejects a full timestamp instead of a plain date', () => {
    expect(parseIsoDate('2026-02-01T10:00:00.000Z')).toBeNull();
  });
});

describe('toIsoDateString', () => {
  it('formats a DateTime back into YYYY-MM-DD', () => {
    expect(toIsoDateString(DateTime.fromISO('2026-09-10'))).toBe('2026-09-10');
  });

  it('returns an empty string for null', () => {
    expect(toIsoDateString(null)).toBe('');
  });
});

describe('isValidIsoDateString', () => {
  it('accepts a strict plain ISO date', () => {
    expect(isValidIsoDateString('2026-09-10')).toBe(true);
  });

  it('rejects a full timestamp', () => {
    expect(isValidIsoDateString('2026-02-01T10:00:00.000Z')).toBe(false);
  });

  it('rejects malformed or empty values', () => {
    expect(isValidIsoDateString('not-a-date')).toBe(false);
    expect(isValidIsoDateString(null)).toBe(false);
  });
});

describe('currentMonthRange', () => {
  it('returns the first and last day of the current month', () => {
    const now = DateTime.now();
    const range = currentMonthRange();

    expect(range.startDate).toBe(now.startOf('month').toISODate());
    expect(range.endDate).toBe(now.endOf('month').toISODate());
    expect(range.startDate <= range.endDate).toBe(true);
  });
});
