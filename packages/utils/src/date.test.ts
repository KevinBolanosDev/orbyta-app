import { describe, expect, it } from 'vitest';

import { toIsoDate } from './date.js';

describe('toIsoDate', () => {
  it('uses the calendar day of the given time zone, not UTC', () => {
    // Las 03:30 UTC del 18-oct todavía son 17-oct en Bogotá (UTC-5).
    const instant = new Date('2026-10-18T03:30:00Z');
    expect(toIsoDate(instant, 'America/Bogota')).toBe('2026-10-17');
    expect(toIsoDate(instant, 'UTC')).toBe('2026-10-18');
  });
});
