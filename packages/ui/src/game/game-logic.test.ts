import { formatCount } from '../lib/format-number';

import {
  hexagonPoints,
  MAX_TILT,
  roundedPolygonPath,
  sheenStripePath,
  tiltFromPoint,
  tiltFromRotation,
  XP_FLOAT_RISE,
  xpFloatFrame,
} from './game-math';
import { levelFromXp, levelTier, totalXpForLevel, xpToNextLevel } from './xp';

describe('XP curve (§5.1)', () => {
  it('costs 300 × n to go from level n to n + 1', () => {
    expect(xpToNextLevel(1)).toBe(300);
    expect(xpToNextLevel(12)).toBe(3600);
    expect(xpToNextLevel(0)).toBe(300);
  });

  it('accumulates the total XP of each level', () => {
    expect(totalXpForLevel(1)).toBe(0);
    expect(totalXpForLevel(2)).toBe(300);
    expect(totalXpForLevel(3)).toBe(900);
    expect(totalXpForLevel(13) - totalXpForLevel(12)).toBe(3600);
  });

  it('reads the level and the progress inside it', () => {
    expect(levelFromXp(0)).toEqual({
      level: 1,
      tier: 'apprentice',
      current: 0,
      goal: 300,
      ratio: 0,
    });
    expect(levelFromXp(-50).level).toBe(1);
    expect(levelFromXp(299).level).toBe(1);
    expect(levelFromXp(300)).toMatchObject({ level: 2, current: 0, goal: 600 });
    // El ejemplo del design system: nivel 12 con 2.450 / 3.600 XP.
    expect(levelFromXp(totalXpForLevel(12) + 2450)).toMatchObject({
      level: 12,
      tier: 'strategist',
      current: 2450,
      goal: 3600,
    });
  });

  it('lands exactly on every level boundary', () => {
    for (let level = 1; level <= 120; level += 1) {
      const start = totalXpForLevel(level);
      expect(levelFromXp(start).level).toBe(level);
      expect(levelFromXp(start - 1).level).toBe(Math.max(level - 1, 1));
    }
  });

  it('names the tier of each level range', () => {
    expect([1, 4, 5, 9, 10, 14, 15, 19, 20, 80].map(levelTier)).toEqual([
      'apprentice',
      'apprentice',
      'organized',
      'organized',
      'strategist',
      'strategist',
      'architect',
      'architect',
      'legend',
      'legend',
    ]);
    expect(levelTier(0)).toBe('apprentice');
  });

  it('formats counts with the locale thousands separator', () => {
    expect(formatCount(3600)).toBe('3.600');
    expect(formatCount(3600, 'en-US')).toBe('3,600');
    expect(formatCount(12.6)).toBe('13');
    expect(formatCount(-1500)).toBe('−1.500');
  });
});

describe('game geometry', () => {
  it('places a pointy-top hexagon inside the square', () => {
    const points = hexagonPoints(100, 2);
    expect(points).toHaveLength(6);
    expect(points[0]?.x).toBeCloseTo(50);
    expect(points[0]?.y).toBeCloseTo(2);
    expect(points[3]?.y).toBeCloseTo(98);
    expect(hexagonPoints(2, 5)[0]).toEqual({ x: 1, y: 1 });
  });

  it('rounds the corners of a polygon', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(roundedPolygonPath(square, 2)).toBe(
      'M2,0L8,0Q10,0 10,2L10,8Q10,10 8,10L2,10Q0,10 0,8L0,2Q0,0 2,0Z',
    );
    // El radio no pasa de la mitad del lado.
    expect(roundedPolygonPath(square, 50)).toContain('Q10,0 10,5');
    expect(roundedPolygonPath(square.slice(0, 2), 2)).toBe('');
  });

  it('sweeps the sheen stripe across the badge, leaning like the card sheen', () => {
    const start = sheenStripePath(0, 100);
    const end = sheenStripePath(1, 100);
    const firstX = (d: string) => Number(/^M(-?[\d.]+)/.exec(d)?.[1]);
    expect(firstX(start)).toBeLessThan(0);
    expect(firstX(end)).toBeGreaterThan(100);
    // Arriba la franja va corrida a la izquierda (−20°).
    const [, topLeft, , , bottomLeft] = /^M([-\d.]+),0L([-\d.]+),0L([-\d.]+),100L([-\d.]+),100Z$/
      .exec(sheenStripePath(0.5, 100))
      ?.map(Number) ?? [0, 0, 0, 0, 0];
    expect(topLeft).toBeLessThan(bottomLeft ?? 0);
  });

  it('tilts the card toward the pointer, up to 8 degrees', () => {
    expect(tiltFromPoint(50, 50, 100, 100)).toEqual({ rotateX: -0, rotateY: 0 });
    expect(tiltFromPoint(100, 0, 100, 100)).toEqual({ rotateX: MAX_TILT, rotateY: MAX_TILT });
    expect(tiltFromPoint(-400, 300, 100, 100)).toEqual({
      rotateX: -MAX_TILT,
      rotateY: -MAX_TILT,
    });
    expect(tiltFromPoint(10, 10, 0, 100)).toEqual({ rotateX: 0, rotateY: 0 });
  });

  it('tilts with the phone rotation and takes the shortest turn', () => {
    const tenDegrees = (10 * Math.PI) / 180;
    expect(tiltFromRotation(tenDegrees, -tenDegrees).rotateX).toBeCloseTo(4);
    expect(tiltFromRotation(tenDegrees, -tenDegrees).rotateY).toBeCloseTo(-4);
    expect(tiltFromRotation(Math.PI, 0).rotateX).toBe(MAX_TILT);
    // De 179° a −179° son 2°, no 358°.
    expect(tiltFromRotation(2 * Math.PI - tenDegrees, 0).rotateX).toBeCloseTo(-4);
  });

  it('rises the XP float and fades it in the second half', () => {
    expect(xpFloatFrame(0, false)).toEqual({ translateY: -0, opacity: 1 });
    expect(xpFloatFrame(0.5, false)).toEqual({ translateY: -XP_FLOAT_RISE / 2, opacity: 1 });
    expect(xpFloatFrame(1, false)).toEqual({ translateY: -XP_FLOAT_RISE, opacity: 0 });
    expect(xpFloatFrame(2, true)).toEqual({ translateY: 0, opacity: 0 });
  });
});
