import {
  applyAmountKey,
  formatAmountInput,
  MAX_INTEGER_DIGITS,
  normalizeAmount,
  parseAmountInput,
  type AmountKey,
} from './amount-input';
import {
  addDaysIso,
  cursorOf,
  formatDay,
  formatDayLong,
  formatRange,
  isInRange,
  isTime,
  joinDateTime,
  lastDayOf,
  lastDays,
  monthGrid,
  monthTitle,
  monthToDate,
  orderRange,
  parseIsoDay,
  shiftMonth,
  shiftTime,
  splitDateTime,
  weekdayLabels,
  weekdayName,
  weekStartOf,
} from './calendar';
import { matchesQuery, normalizeSearch } from './search';
import {
  PULL_THRESHOLD,
  pullOffset,
  pullProgress,
  SWIPE_THRESHOLD,
  swipeOffset,
  swipeRelease,
} from './swipe';

const type = (keys: readonly AmountKey[], decimals: number, start = '') =>
  keys.reduce((value, key) => applyAmountKey(value, key, decimals), start);

describe('amount input', () => {
  it('builds COP amounts without leading zeros or decimals', () => {
    expect(type(['0', '0', '1', '2', '000'], 0)).toBe('12000');
    expect(type(['000'], 0)).toBe('');
    expect(type(['0', '000'], 0)).toBe('0');
    expect(type(['5', 'decimal', '3'], 0)).toBe('53');
  });

  it('builds USD amounts with at most two decimals', () => {
    expect(type(['decimal', '5'], 2)).toBe('0.5');
    expect(type(['1', '2', 'decimal', '3', '4', '5'], 2)).toBe('12.34');
    expect(type(['1', 'decimal', 'decimal', '5'], 2)).toBe('1.5');
  });

  it('erases digit by digit, including the decimal point', () => {
    expect(type(['backspace'], 2, '12.34')).toBe('12.3');
    expect(type(['backspace', 'backspace'], 2, '12.34')).toBe('12.');
    expect(type(['backspace', 'backspace', 'backspace'], 2, '12.34')).toBe('12');
    expect(type(['backspace'], 0, '')).toBe('');
  });

  it('stops at the maximum integer digits', () => {
    const full = '9'.repeat(MAX_INTEGER_DIGITS);
    expect(applyAmountKey(full, '1', 0)).toBe(full);
  });

  it('parses what is typed in each locale', () => {
    expect(parseAmountInput('1.234.567', 'es-CO', 0)).toBe('1234567');
    expect(parseAmountInput('1.234,567', 'es-CO', 2)).toBe('1234.56');
    expect(parseAmountInput('1,234.5', 'en-US', 2)).toBe('1234.5');
    expect(parseAmountInput(',5', 'es-CO', 2)).toBe('0.5');
    expect(parseAmountInput('00012', 'es-CO', 0)).toBe('12');
    expect(parseAmountInput('$ abc', 'es-CO', 0)).toBe('');
    expect(parseAmountInput('12,', 'es-CO', 2)).toBe('12.');
    expect(parseAmountInput('1.234,56', 'es-CO', 0)).toBe('1234');
  });

  it('formats while typing, keeping a trailing separator', () => {
    expect(formatAmountInput('', 'es-CO')).toBe('');
    expect(formatAmountInput('1234567', 'es-CO')).toBe('1.234.567');
    expect(formatAmountInput('1234.', 'es-CO')).toBe('1.234,');
    expect(formatAmountInput('1234.5', 'en-US')).toBe('1,234.5');
    expect(normalizeAmount('12.')).toBe('12');
    expect(normalizeAmount('12.5')).toBe('12.5');
  });
});

describe('calendar', () => {
  it('starts the week on Monday in Spanish and Sunday in English', () => {
    expect(weekStartOf('es-CO')).toBe(1);
    expect(weekStartOf('en-US')).toBe(0);
    expect(weekdayLabels('es-CO')).toHaveLength(7);
    expect(weekdayLabels('en-US')[0]).toBe('S');
    expect(weekdayName('2026-10-19', 'es-CO')).toBe('lunes');
  });

  it('builds a 6-week grid with the days of the month marked', () => {
    const grid = monthGrid({ year: 2026, month: 9 }, 1);
    expect(grid).toHaveLength(6);
    expect(grid.every((week) => week.length === 7)).toBe(true);
    // Octubre de 2026 empieza un jueves: la grilla arranca el lunes 28 de septiembre.
    expect(grid[0]?.[0]).toEqual({ iso: '2026-09-28', day: 28, inMonth: false });
    expect(grid.flat().filter((day) => day.inMonth)).toHaveLength(31);
  });

  it('moves between months and days across year ends', () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01');
    expect(cursorOf('2026-02-10')).toEqual({ year: 2026, month: 1 });
    expect(lastDayOf({ year: 2028, month: 1 })).toBe('2028-02-29');
  });

  it('rejects invalid days', () => {
    expect(() => parseIsoDay('2026-02-30')).toThrow('Invalid ISO day');
    expect(() => parseIsoDay('19/10/2026')).toThrow('Invalid ISO day');
  });

  it('formats days, months and ranges per language', () => {
    expect(monthTitle({ year: 2026, month: 9 }, 'es-CO')).toBe('Octubre 2026');
    expect(monthTitle({ year: 2026, month: 9 }, 'en-US')).toBe('October 2026');
    expect(formatDay('2026-10-19', 'es-CO')).toBe('19 oct 2026');
    expect(formatDay('2026-10-19', 'en-US')).toBe('Oct 19, 2026');
    expect(formatDayLong('2026-10-19', 'es-CO')).toBe('19 de octubre de 2026');
    expect(formatRange({ start: '2026-10-01', end: '2026-10-19' }, 'es-CO')).toBe(
      '1 oct 2026 – 19 oct 2026',
    );
    expect(formatRange({ start: '2026-10-19', end: '2026-10-19' }, 'es-CO')).toBe('19 oct 2026');
  });

  it('orders ranges and builds the shortcuts', () => {
    expect(orderRange('2026-10-19', '2026-10-01')).toEqual({
      start: '2026-10-01',
      end: '2026-10-19',
    });
    expect(isInRange('2026-10-05', { start: '2026-10-01', end: '2026-10-19' })).toBe(true);
    expect(isInRange('2026-10-20', { start: '2026-10-01', end: '2026-10-19' })).toBe(false);
    expect(lastDays('2026-10-19', 7)).toEqual({ start: '2026-10-13', end: '2026-10-19' });
    expect(monthToDate('2026-10-19')).toEqual({ start: '2026-10-01', end: '2026-10-19' });
  });

  it('handles times and date-times', () => {
    expect(isTime('09:05')).toBe(true);
    expect(isTime('24:00')).toBe(false);
    expect(shiftTime('23:55', 10)).toBe('00:05');
    expect(shiftTime('00:00', -5)).toBe('23:55');
    expect(splitDateTime('2026-10-19T14:30')).toEqual({ day: '2026-10-19', time: '14:30' });
    expect(splitDateTime('2026-10-19')).toEqual({ day: '2026-10-19', time: '00:00' });
    expect(joinDateTime('2026-10-19', '08:00')).toBe('2026-10-19T08:00');
  });
});

describe('search', () => {
  it('ignores case, accents and extra spaces', () => {
    expect(normalizeSearch('  Crédito   Hipotecario ')).toBe('credito hipotecario');
    expect(matchesQuery('credito', 'Crédito')).toBe(true);
    expect(matchesQuery('COMIDA rapida', 'Comida', 'Rápida y domicilios')).toBe(true);
    expect(matchesQuery('cine', 'Comida')).toBe(false);
    expect(matchesQuery('', 'Comida')).toBe(true);
  });
});

describe('swipe and pull', () => {
  it('moves only toward an action and resists past the threshold', () => {
    expect(swipeOffset(50, true, false)).toBe(50);
    expect(swipeOffset(-50, true, false)).toBe(0);
    expect(swipeOffset(50, false, true)).toBe(0);
    expect(swipeOffset(-(SWIPE_THRESHOLD + 100), false, true)).toBeCloseTo(-(SWIPE_THRESHOLD + 35));
  });

  it('runs the action when armed or flung toward it', () => {
    expect(swipeRelease(SWIPE_THRESHOLD, 0)).toBe('leading');
    expect(swipeRelease(-SWIPE_THRESHOLD, 0)).toBe('trailing');
    expect(swipeRelease(-40, -1500)).toBe('trailing');
    expect(swipeRelease(-40, 1500)).toBe('none');
    expect(swipeRelease(0, 2000)).toBe('none');
  });

  it('pulls with resistance and fills the ring', () => {
    expect(pullOffset(-20)).toBe(0);
    expect(pullOffset(100)).toBe(50);
    expect(pullProgress(PULL_THRESHOLD / 2)).toBe(0.5);
    expect(pullProgress(PULL_THRESHOLD * 2)).toBe(1);
  });
});
