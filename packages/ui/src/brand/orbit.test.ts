import { ORBIT, orbitFrame, orbitPhase, orbitVertices, projectPoint } from './orbit';

const round = (value: number) => Math.round(value * 10) / 10;

describe('orbitFrame', () => {
  const rest = orbitFrame(ORBIT.restPhi);

  it('returns the exact rest ring path of §11.3', () => {
    expect(rest.ringPath).toBe(
      'M113.9,68.7 L167.9,62.2 L177.1,90.7 L109.2,128.5 L32.1,137.8 L22.9,109.3 L70.4,82.9',
    );
  });

  it('places the five module icons exactly as the rest pose table', () => {
    expect(
      rest.slots.map((slot) => [slot.moduleId, round(slot.x), round(slot.y), round(slot.depth)]),
    ).toEqual([
      ['expenses', 177.1, 90.7, 0.5],
      ['stocks', 109.2, 128.5, 1],
      ['wealth', 32.1, 137.8, 0.5],
      ['agenda', 22.9, 109.3, -0.5],
      ['habits', 167.9, 62.2, -0.5],
    ]);
  });

  it('keeps the gap vertex empty and hidden behind the planet', () => {
    expect(rest.slots).toHaveLength(5);
    const gap = rest.vertices[ORBIT.gapVertex];
    expect(gap && round(gap.x)).toBe(90.8);
    expect(gap && round(gap.y)).toBe(71.5);
    expect(gap && round(gap.depth)).toBe(-1);
  });

  it('derives size, layer and opacity from the depth', () => {
    const slot = (id: string) => rest.slots.find((entry) => entry.moduleId === id);
    expect(slot('stocks')).toMatchObject({ size: 38, layer: 'front', opacity: 1 });
    expect(slot('expenses')).toMatchObject({ size: 34.5, layer: 'front', opacity: 1 });
    expect(slot('agenda')?.layer).toBe('back');
    expect(slot('agenda')?.size).toBeCloseTo(27.5);
    expect(slot('agenda')?.opacity).toBeCloseTo(0.75);
  });

  it('moves front icons to the left as φ grows (M20)', () => {
    const later = orbitFrame(ORBIT.restPhi + 0.2);
    const stocksNow = rest.slots.find((slot) => slot.moduleId === 'stocks');
    const stocksLater = later.slots.find((slot) => slot.moduleId === 'stocks');
    expect(stocksLater && stocksNow && stocksLater.x < stocksNow.x).toBe(true);
  });
});

describe('orbit helpers', () => {
  it('projects the center onto the canvas center', () => {
    expect(projectPoint(0, 0)).toEqual({ x: 100, y: 100 });
  });

  it('returns six vertices', () => {
    expect(orbitVertices(0)).toHaveLength(6);
  });

  it('turns once every turn and starts at rest', () => {
    expect(orbitPhase(0, 36_000)).toBe(ORBIT.restPhi);
    expect(orbitPhase(36_000, 36_000)).toBe(ORBIT.restPhi);
    expect(orbitPhase(18_000, 36_000)).toBeCloseTo(ORBIT.restPhi + Math.PI);
  });
});
