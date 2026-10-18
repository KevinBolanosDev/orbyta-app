import {
  breakpoints,
  categoryColors,
  categoryPalette,
  darkColors,
  duration,
  easing,
  exitDuration,
  fontFamily,
  lightColors,
  MODULE_IDS,
  moduleCategoryIndex,
  moduleColors,
  modulePalettes,
  space,
  typeScale,
  zIndex,
} from './index';

describe('color tokens', () => {
  it('derive info and focus from secondary and primary in both themes', () => {
    for (const colors of [darkColors, lightColors]) {
      expect(colors.info).toBe(colors.secondary);
      expect(colors.focus).toBe(colors.primary);
    }
  });

  it('have eight category colors per theme', () => {
    expect(categoryColors.dark).toHaveLength(8);
    expect(categoryColors.light).toHaveLength(8);
  });
});

describe('module colors', () => {
  it('match the first five category colors (§11.6)', () => {
    for (const id of MODULE_IDS) {
      const index = moduleCategoryIndex[id];
      expect(modulePalettes[id].dark).toBe(categoryColors.dark[index]);
      expect(modulePalettes[id].light).toBe(categoryColors.light[index]);
    }
  });

  it('resolve the module color per theme', () => {
    expect(moduleColors('dark').stocks.color).toBe('#4C7DFF');
    expect(moduleColors('light').stocks.color).toBe('#1E5CFF');
    expect(moduleColors('light').stocks.shade).toBe('#1C2E8C');
  });

  it('skip the module color when assigning categories inside that module', () => {
    const palette = categoryPalette('dark', 'expenses');
    expect(palette).toHaveLength(7);
    expect(palette).not.toContain(modulePalettes.expenses.dark);
    expect(categoryPalette('dark')).toBe(categoryColors.dark);
  });
});

describe('layout tokens', () => {
  it('use a 4 pt grid', () => {
    for (const value of Object.values(space)) {
      expect(value % 4).toBe(0);
    }
  });

  it('start breakpoints at 0 and grow (Unistyles requirement)', () => {
    const widths = Object.values(breakpoints);
    expect(widths[0]).toBe(0);
    expect([...widths].sort((a, b) => a - b)).toEqual(widths);
  });

  it('keep the lock screen above every other layer', () => {
    const { lock, ...rest } = zIndex;
    expect(Math.max(...Object.values(rest))).toBeLessThan(lock);
  });
});

describe('typography tokens', () => {
  it('only reference registered font families', () => {
    for (const style of Object.values(typeScale)) {
      expect(Object.keys(fontFamily)).toContain(style.family);
    }
  });

  it('never shrink a role on wider screens', () => {
    for (const style of Object.values(typeScale)) {
      expect(style.wide.fontSize).toBeGreaterThanOrEqual(style.compact.fontSize);
      expect(style.compact.lineHeight).toBeGreaterThanOrEqual(style.compact.fontSize);
    }
  });
});

describe('motion tokens', () => {
  it('keep frequent interactions under half a second (§4.1)', () => {
    expect(duration.instant).toBeLessThan(500);
    expect(duration.fast).toBeLessThan(500);
    expect(duration.base).toBeLessThan(500);
  });

  it('exit faster than they enter', () => {
    expect(exitDuration(duration.slow)).toBe(420);
    expect(exitDuration(duration.slow)).toBeLessThan(duration.slow);
  });

  it('define valid cubic-bezier curves (x between 0 and 1)', () => {
    for (const [x1, , x2] of Object.values(easing)) {
      expect(x1).toBeGreaterThanOrEqual(0);
      expect(x1).toBeLessThanOrEqual(1);
      expect(x2).toBeGreaterThanOrEqual(0);
      expect(x2).toBeLessThanOrEqual(1);
    }
  });
});
