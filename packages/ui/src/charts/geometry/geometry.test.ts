import { areaPath, linePath, pathLength, seriesPoints, trendOf } from './line';
import { extentOf, linear, nearestIndex, niceTicks, plotBox, spreadX } from './scale';
import {
  barLayout,
  candleLayout,
  donutSlices,
  heatLevel,
  heatmapCells,
  rectPath,
  sliceAt,
  slicePath,
} from './shapes';

const BOX = plotBox(100, 50);

describe('scales', () => {
  it('builds the plot box without going negative', () => {
    expect(plotBox(200, 100, { top: 10, right: 0, bottom: 20, left: 5 })).toEqual({
      x: 5,
      y: 10,
      width: 195,
      height: 70,
    });
    expect(plotBox(10, 10, { top: 20, right: 20, bottom: 0, left: 0 }).width).toBe(0);
  });

  it('opens flat or empty extents and can include zero', () => {
    expect(extentOf([])).toEqual([0, 1]);
    expect(extentOf([5, 5])).toEqual([4.5, 5.5]);
    expect(extentOf([0, 0])).toEqual([-1, 1]);
    expect(extentOf([3, 8])).toEqual([3, 8]);
    expect(extentOf([3, 8], true)).toEqual([0, 8]);
    expect(extentOf([-4, -1], true)).toEqual([-4, 0]);
  });

  it('scales linearly and rounds ticks to nice values', () => {
    expect(linear([0, 10], [100, 0])(5)).toBe(50);
    expect(linear([4, 4], [0, 80])(4)).toBe(40);
    const { domain, ticks } = niceTicks([3, 97], 3);
    expect(domain).toEqual([0, 100]);
    expect(ticks).toEqual([0, 50, 100]);
  });

  it.each([
    // Valores de d3-scale 4.0.2: `scaleLinear().domain(d).nice(n)`, `.domain()` y `.ticks(n)`.
    [[3, 97], 3, [0, 100], [0, 50, 100]],
    [[0.12, 0.87], 4, [0, 1], [0, 0.2, 0.4, 0.6, 0.8, 1]],
    [[-37, 81], 5, [-40, 100], [-40, -20, 0, 20, 40, 60, 80, 100]],
    [
      [118_400_000, 134_900_000],
      3,
      [115_000_000, 135_000_000],
      [115_000_000, 120_000_000, 125_000_000, 130_000_000, 135_000_000],
    ],
    [[90, 10], 2, [100, 0], [100, 50, 0]],
    [[5, 5], 3, [5, 5], [5]],
    [
      [1_850_000, 2_410_000],
      3,
      [1_800_000, 2_600_000],
      [1_800_000, 2_000_000, 2_200_000, 2_400_000, 2_600_000],
    ],
    [[-0.004, 0.013], 4, [-0.005, 0.015], [-0.005, 0, 0.005, 0.01, 0.015]],
    [[0, 1], 10, [0, 1], [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]],
  ] as const)('matches d3 for %j with %d ticks', (domain, count, nice, marks) => {
    expect(niceTicks(domain, count)).toEqual({ domain: nice, ticks: marks });
  });

  it('spreads points and finds the nearest one', () => {
    expect(spreadX(0, BOX)).toEqual([]);
    expect(spreadX(1, BOX)).toEqual([50]);
    expect(spreadX(3, BOX)).toEqual([0, 50, 100]);
    expect(nearestIndex([], 10)).toBe(-1);
    expect(nearestIndex([0, 50, 100], 24)).toBe(0);
    expect(nearestIndex([0, 50, 100], 26)).toBe(1);
    expect(nearestIndex([0, 50, 100], 400)).toBe(2);
  });
});

describe('lines and areas', () => {
  it('places the maximum at the top and the minimum at the bottom', () => {
    const points = seriesPoints([10, 20], BOX);
    expect(points).toEqual([
      { x: 0, y: 50 },
      { x: 100, y: 0 },
    ]);
  });

  it('draws paths, even with one point', () => {
    const points = seriesPoints([1, 3, 2], BOX);
    expect(linePath(points)).toMatch(/^M0,50/);
    expect(linePath([])).toBe('');
    expect(linePath([{ x: 4, y: 5 }])).toBe('M4,5h0.01');
    expect(areaPath(points, 50)).toMatch(/Z$/);
    expect(areaPath([{ x: 1, y: 1 }], 50)).toBe('');
  });

  it('estimates the stroke length with some slack', () => {
    expect(pathLength([])).toBe(1);
    // Cubre el trazo recto (50) con al menos un 10 % de margen.
    expect(
      pathLength([
        { x: 0, y: 0 },
        { x: 30, y: 40 },
      ]),
    ).toBeGreaterThanOrEqual(55);
  });

  it('reads the trend from the first and last values', () => {
    expect(trendOf([1, 5, 3])).toBe('up');
    expect(trendOf([5, 1])).toBe('down');
    expect(trendOf([2, 9, 2])).toBe('flat');
    expect(trendOf([])).toBe('flat');
  });
});

describe('bars and candles', () => {
  it('lays vertical bars on the zero line, negatives below', () => {
    const { bars, zero } = barLayout([10, -10], plotBox(100, 100));
    expect(zero).toBe(50);
    expect(bars[0]).toMatchObject({ y: 0, height: 50, negative: false });
    expect(bars[1]).toMatchObject({ y: 50, height: 50, negative: true });
    expect(bars[0]?.width).toBeCloseTo(50 * 0.65);
  });

  it('lays horizontal bars from the zero line', () => {
    const { bars, zero } = barLayout([4, 8], plotBox(100, 40), 'horizontal');
    expect(zero).toBe(0);
    expect(bars[1]).toMatchObject({ x: 0, width: 100 });
    expect(bars[0]?.width).toBe(50);
    expect(bars[1]?.y).toBeGreaterThan(bars[0]?.y ?? 0);
  });

  it('builds candles with a minimum body', () => {
    const [up, flat] = candleLayout(
      [
        { open: 10, high: 20, low: 0, close: 15 },
        { open: 12, high: 14, low: 8, close: 12 },
      ],
      plotBox(100, 100),
    );
    expect(up).toMatchObject({ x: 25, wickTop: 0, wickBottom: 100, bodyTop: 25, up: true });
    expect(up?.bodyHeight).toBe(25);
    expect(flat?.bodyHeight).toBe(1);
  });

  it('draws rounded rectangles', () => {
    expect(rectPath(0, 0, 10, 4)).toBe('M0,0h10v4h-10Z');
    expect(rectPath(0, 0, 10, 4, 10)).toContain('a2,2');
    expect(rectPath(0, 0, -5, 4)).toBe('M0,0h0v4h0Z');
  });
});

describe('donut', () => {
  it('keeps the data order and ignores negatives', () => {
    const slices = donutSlices([1, 3, -2]);
    expect(slices.map((s) => s.share)).toEqual([0.25, 0.75, 0]);
    expect(slices[0]?.startAngle).toBe(0);
    expect(slices[1]?.endAngle).toBeCloseTo(Math.PI * 2);
    expect(donutSlices([0, 0])).toEqual([]);
    expect(
      slicePath(slices[0] ?? { index: 0, startAngle: 0, endAngle: 1, share: 1 }, 40, 60),
    ).toMatch(/^M/);
  });

  it('finds the slice under a touch', () => {
    const slices = donutSlices([1, 1, 1, 1]);
    expect(sliceAt(slices, 0, -50, 40, 60)).toBe(0); // arriba
    expect(sliceAt(slices, 50, 1, 40, 60)).toBe(1); // derecha, un poco abajo
    expect(sliceAt(slices, -50, -1, 40, 60)).toBe(3); // izquierda
    expect(sliceAt(slices, 0, 0, 40, 60)).toBeNull(); // hueco
    expect(sliceAt(slices, 100, 0, 40, 60)).toBeNull(); // afuera
  });
});

describe('heatmap', () => {
  it('maps values to five levels', () => {
    expect(heatLevel(undefined, 10)).toBe(0);
    expect(heatLevel(0, 10)).toBe(0);
    expect(heatLevel(2, 10)).toBe(1);
    expect(heatLevel(4, 10)).toBe(2);
    expect(heatLevel(7, 10)).toBe(3);
    expect(heatLevel(10, 10)).toBe(4);
    expect(heatLevel(3, 0)).toBe(0);
  });

  it('places each day in its week column and weekday row', () => {
    // El 2026-10-19 es lunes: con la semana desde el lunes queda en la fila 0.
    const { cells, columns } = heatmapCells(
      '2026-10-17',
      '2026-10-26',
      { '2026-10-19': 3, '2026-10-26': 6 },
      1,
    );
    expect(cells[0]).toMatchObject({ iso: '2026-10-17', column: 0, row: 5, level: 0 });
    expect(cells.find((c) => c.iso === '2026-10-19')).toMatchObject({
      column: 1,
      row: 0,
      level: 2,
    });
    expect(cells.at(-1)).toMatchObject({ iso: '2026-10-26', column: 2, row: 0, level: 4 });
    expect(columns).toBe(3);
    expect(heatmapCells('2026-10-19', '2026-10-18', {}, 0)).toEqual({ cells: [], columns: 0 });
  });
});
