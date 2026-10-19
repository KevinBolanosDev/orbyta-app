import { candles, habitDays, walk } from './sample-series';

describe('sample series', () => {
  it('repeats the same data for the same seed', () => {
    expect(walk(5, 100, 1, 10, 3)).toEqual(walk(5, 100, 1, 10, 3));
    expect(walk(5, 100, 1, 10, 3)).not.toEqual(walk(5, 100, 1, 10, 4));
    expect(walk(3, 100, 0, 0, 1)).toEqual([100, 100, 100]);
  });

  it('chains candles and keeps high and low around the body', () => {
    const [first, second] = candles(2, 100, 1);
    expect(second?.open).toBe(first?.close);
    for (const candle of candles(10, 100, 2)) {
      expect(candle.high).toBeGreaterThanOrEqual(Math.max(candle.open, candle.close));
      expect(candle.low).toBeLessThanOrEqual(Math.min(candle.open, candle.close));
    }
  });

  it('marks most days as done', () => {
    const days = Array.from({ length: 100 }, (_, i) => `d${i.toString()}`);
    const done = Object.keys(habitDays(days, 5)).length;
    expect(done).toBeGreaterThan(50);
    expect(done).toBeLessThan(100);
  });
});
