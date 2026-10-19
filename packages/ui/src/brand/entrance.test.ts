import {
  brandEase,
  ENTRANCE_DONE,
  ENTRANCE_DURATION,
  entranceAt,
  trailPoint,
  trailSplit,
  twinkleScale,
} from './entrance';

describe('entranceAt (M21)', () => {
  it('starts with the planet small and hidden and the star still inside it', () => {
    const start = entranceAt(0);
    expect(start.planetOpacity).toBe(0);
    expect(start.planetScale).toBeCloseTo(0.2);
    expect(start.orbitScale).toBeCloseTo(0.6);
    expect(start.trailProgress).toBe(0);
    expect(start.starOpacity).toBe(0);
    expect(start.sparkleScale).toBe(0);
  });

  it('runs the star along the trail, growing and spinning back to 0°', () => {
    const middle = entranceAt(1650);
    expect(middle.starOpacity).toBe(1);
    expect(middle.starProgress).toBeGreaterThan(0);
    expect(middle.starProgress).toBeLessThan(1);
    expect(middle.starRotation).toBeLessThan(0);
    expect(middle.sheenProgress).toBe(null);
    expect(entranceAt(1950).sheenProgress).toBeGreaterThan(0);
  });

  it('ends in the final state within 2.4 s', () => {
    expect(ENTRANCE_DURATION).toBeLessThanOrEqual(2400);
    expect(entranceAt(ENTRANCE_DURATION)).toBe(ENTRANCE_DONE);
    expect(entranceAt(ENTRANCE_DURATION - 1).starProgress).toBeCloseTo(1);
  });
});

describe('brand easing and trail', () => {
  it('maps 0 → 0 and 1 → 1', () => {
    for (const ease of [
      brandEase.power2Out,
      brandEase.power2InOut,
      brandEase.power3Out,
      brandEase.sineInOut,
      brandEase.backOut(1.8),
    ]) {
      expect(ease(0)).toBeCloseTo(0);
      expect(ease(1)).toBeCloseTo(1);
    }
    expect(brandEase.power2InOut(0.25)).toBeCloseTo(0.0625);
  });

  it('goes from the planet center to the star at (150, 40)', () => {
    expect(trailPoint(0)).toEqual({ x: 100, y: 100 });
    expect(trailPoint(1)).toEqual({ x: 150, y: 40 });
    expect(trailSplit(1).path).toBe('M100,100 C112,78 128,56 150,40');
  });

  it('twinkles from 1 down to 0.8 and back every 3.2 s (M23)', () => {
    expect(twinkleScale(0)).toBe(1);
    expect(twinkleScale(1600)).toBeCloseTo(0.8);
    expect(twinkleScale(3200)).toBe(1);
  });
});
