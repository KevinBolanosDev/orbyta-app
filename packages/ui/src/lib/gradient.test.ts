import { cssAngleToSvgVector, toCssLinearGradient } from './gradient';

describe('cssAngleToSvgVector', () => {
  it.each([
    [0, { x1: 0.5, y1: 1, x2: 0.5, y2: 0 }],
    [90, { x1: 0, y1: 0.5, x2: 1, y2: 0.5 }],
    [180, { x1: 0.5, y1: 0, x2: 0.5, y2: 1 }],
    [270, { x1: 1, y1: 0.5, x2: 0, y2: 0.5 }],
  ])('maps %i° like CSS linear-gradient', (angle, expected) => {
    expect(cssAngleToSvgVector(angle)).toEqual(expected);
  });

  it('goes from top-left to bottom-right for the 125° holo gradient', () => {
    const { x1, y1, x2, y2 } = cssAngleToSvgVector(125);
    expect(x1).toBeLessThan(x2);
    expect(y1).toBeLessThan(y2);
  });
});

describe('toCssLinearGradient', () => {
  it('writes the CSS value', () => {
    expect(
      toCssLinearGradient({
        angleDeg: 125,
        stops: [
          { color: '#2EE6F2', offset: 0 },
          { color: '#8B5CFF', offset: 0.5 },
          { color: '#4C7DFF', offset: 1 },
        ],
      }),
    ).toBe('linear-gradient(125deg, #2EE6F2 0%, #8B5CFF 50%, #4C7DFF 100%)');
  });
});
