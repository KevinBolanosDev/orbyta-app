import { composite, contrastRatio, parseColor, relativeLuminance, toHex, withAlpha } from './color';

describe('parseColor', () => {
  it('reads short, long and alpha hex colors', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('#2EE6F2')).toEqual({ r: 46, g: 230, b: 242, a: 1 });
    expect(parseColor('#00000080').a).toBeCloseTo(0.502, 3);
  });

  it('reads rgb() and rgba()', () => {
    expect(parseColor('rgb(1, 2, 3)')).toEqual({ r: 1, g: 2, b: 3, a: 1 });
    expect(parseColor('rgba(46,230,242,0.35)')).toEqual({ r: 46, g: 230, b: 242, a: 0.35 });
  });

  it('rejects unsupported formats', () => {
    expect(() => parseColor('cyan')).toThrow('Unsupported color: cyan');
  });
});

describe('toHex and withAlpha', () => {
  it('round-trips colors', () => {
    expect(toHex(parseColor('#060a16'))).toBe('#060A16');
    expect(withAlpha('#2EE6F2', 0.5)).toBe('rgba(46,230,242,0.5)');
  });
});

describe('composite', () => {
  it('blends a translucent color over an opaque background', () => {
    const white = parseColor('#FFFFFF');
    const black = parseColor('#000000');
    expect(composite({ ...white, a: 0.5 }, black)).toEqual({ r: 128, g: 128, b: 128, a: 1 });
    expect(composite(white, black)).toEqual(white);
  });
});

describe('contrast', () => {
  it('matches the WCAG reference values', () => {
    expect(relativeLuminance(parseColor('#FFFFFF'))).toBeCloseTo(1, 5);
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('is symmetric for opaque colors', () => {
    expect(contrastRatio('#2EE6F2', '#060A16')).toBeCloseTo(
      contrastRatio('#060A16', '#2EE6F2'),
      10,
    );
  });

  it('composites a translucent foreground before measuring', () => {
    // Blanco al 0 % sobre negro es negro: contraste 1.
    expect(contrastRatio('rgba(255,255,255,0)', '#000000')).toBeCloseTo(1, 5);
  });
});
