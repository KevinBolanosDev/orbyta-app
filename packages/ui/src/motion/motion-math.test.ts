import { distance, glassGeometry, MAX_STAGGERED_ROWS, stagger } from '../tokens';

import { clampProgress, orbDriftTarget, sheenTranslateX, staggerDelay } from './motion-math';

describe('staggerDelay', () => {
  it('uses the screen step by default', () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(2)).toBe(2 * stagger.screen);
  });

  it('caps the delay at the last animated row', () => {
    const last = (MAX_STAGGERED_ROWS - 1) * stagger.list;
    expect(staggerDelay(MAX_STAGGERED_ROWS - 1, stagger.list)).toBe(last);
    expect(staggerDelay(40, stagger.list)).toBe(last);
  });

  it('treats negative indexes as the first row', () => {
    expect(staggerDelay(-3)).toBe(0);
  });
});

describe('clampProgress', () => {
  it('keeps values between 0 and 1', () => {
    expect(clampProgress(-0.2)).toBe(0);
    expect(clampProgress(0.4)).toBe(0.4);
    expect(clampProgress(1.7)).toBe(1);
  });
});

describe('sheenTranslateX', () => {
  const width = 300;
  const stripe = width * glassGeometry.sheen.widthRatio;

  it('starts and ends outside the surface', () => {
    expect(sheenTranslateX(0, width, stripe) + stripe).toBeLessThan(0);
    expect(sheenTranslateX(1, width, stripe)).toBeGreaterThan(width);
  });

  it('is centered halfway (the static position)', () => {
    expect(sheenTranslateX(0.5, width, stripe)).toBeCloseTo((width - stripe) / 2);
  });
});

describe('orbDriftTarget', () => {
  const max = distance.orbDrift;

  it('is stable for the same seed', () => {
    expect(orbDriftTarget(7, max)).toEqual(orbDriftTarget(7, max));
  });

  it('stays within the drift range and differs between orbs', () => {
    const targets = [1, 2, 3].map((seed) => orbDriftTarget(seed, max));
    for (const { x, y } of targets) {
      expect(Math.abs(x)).toBeLessThanOrEqual(max);
      expect(Math.abs(y)).toBeLessThanOrEqual(max);
    }
    expect(new Set(targets.map(({ x, y }) => `${x},${y}`)).size).toBe(3);
  });
});
