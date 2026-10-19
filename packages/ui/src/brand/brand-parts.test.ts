import { MODULE_IDS, modulePalettes } from '../tokens/modules';

import { MODULE_GLYPHS } from './glyphs';
import { brandMarkParts, brandVariantForSize, markViewBox } from './mark';
import { moduleGlyphParts, moduleIconParts } from './module-icon';
import { el, renderSvgString, round1, scaleAround, svgDocument } from './svg-tree';

const ids = (svg: string) => [...svg.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]);

describe('svg tree', () => {
  it('writes kebab-case attributes, keeps SVG camelCase ones and escapes values', () => {
    const svg = renderSvgString(
      el('linearGradient', { id: 'a&b', gradientUnits: 'userSpaceOnUse', x1: 0.12345 }, [
        el('stop', { stopColor: '#FFF', offset: 1, unused: undefined }),
      ]),
    );
    expect(svg).toBe(
      '<linearGradient id="a&amp;b" gradientUnits="userSpaceOnUse" x1="0.123">' +
        '<stop stop-color="#FFF" offset="1"/></linearGradient>',
    );
  });

  it('keeps style text raw and escapes plain text', () => {
    expect(renderSvgString(el('style', {}, [], { text: 'a>b{}' }))).toBe('<style>a>b{}</style>');
    expect(renderSvgString(el('text', {}, [], { text: 'A & B' }))).toBe('<text>A &amp; B</text>');
  });

  it('wraps parts in a document and rounds helpers', () => {
    const svg = svgDocument(
      { defs: [el('clipPath', { id: 'c' })], body: [el('g')] },
      {
        viewBox: '0 0 10 10',
      },
    );
    expect(
      svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs>'),
    ).toBe(true);
    expect(round1(-0.04)).toBe(0);
    expect(scaleAround(2, 100, 100)).toBe('translate(100 100) scale(2) translate(-100 -100)');
  });
});

describe('brand mark parts', () => {
  it('picks the variant by size (§11.4)', () => {
    expect(brandVariantForSize(200)).toBe('animated');
    expect(brandVariantForSize(160)).toBe('animated');
    expect(brandVariantForSize(120)).toBe('icons');
    expect(brandVariantForSize(64)).toBe('dots');
    expect(brandVariantForSize(31)).toBe('mono');
    expect(markViewBox('animated')).toBe('-18 -18 236 236');
    expect(markViewBox('icons')).toBe('0 0 200 200');
  });

  it.each(['animated', 'icons', 'dots', 'mono'] as const)(
    'draws the %s variant with unique, prefixed ids',
    (variant) => {
      const svg = svgDocument(brandMarkParts({ variant, scheme: 'dark', idPrefix: 'x' }), {
        viewBox: markViewBox(variant),
      });
      const found = ids(svg);
      expect(found.length).toBeGreaterThan(0);
      expect(new Set(found).size).toBe(found.length);
      expect(found.every((id) => id?.startsWith('x-'))).toBe(true);
    },
  );

  it('uses module colored dots in the dots variant', () => {
    const svg = svgDocument(brandMarkParts({ variant: 'dots', scheme: 'light', idPrefix: 'd' }), {
      viewBox: '0 0 200 200',
    });
    for (const id of MODULE_IDS) expect(svg).toContain(modulePalettes[id].light);
  });

  it('draws the five module glyphs in the icons variant', () => {
    const svg = svgDocument(brandMarkParts({ variant: 'icons', scheme: 'dark', idPrefix: 'i' }), {
      viewBox: '0 0 200 200',
    });
    for (const id of MODULE_IDS) expect(svg).toContain(MODULE_GLYPHS[id][0]);
  });

  it('cuts the planet around the front orbit in the mono variant', () => {
    const svg = svgDocument(
      brandMarkParts({ variant: 'mono', scheme: 'dark', idPrefix: 'm', monoColor: '#123456' }),
      { viewBox: '0 0 200 200' },
    );
    expect(svg).toContain('mask="url(#m-cut)"');
    expect(svg).toContain('#123456');
    expect(svg).not.toContain('url(#m-planet)');
  });
});

describe('module icon parts (BR02)', () => {
  it('uses the module color of each theme and the dark glyph', () => {
    const dark = svgDocument(moduleIconParts('agenda', 'dark', 'a'), { viewBox: '0 0 200 200' });
    const light = svgDocument(moduleIconParts('agenda', 'light', 'a'), { viewBox: '0 0 200 200' });
    expect(dark).toContain(modulePalettes.agenda.dark);
    expect(light).toContain(modulePalettes.agenda.light);
    expect(dark).toContain('#04121A');
    expect(light).toContain('stroke="#FFFFFF"');
  });

  it('knocks the glyph and the dot border out in mono', () => {
    const svg = svgDocument(moduleIconParts('habits', 'mono', 'h'), { viewBox: '0 0 200 200' });
    expect(svg).toContain('mask="url(#h-glyph-cut)"');
    expect(svg).toContain('mask="url(#h-dot-cut)"');
  });

  it('draws only the glyph below the minimum size', () => {
    const svg = svgDocument(moduleGlyphParts('stocks', '#4C7DFF', 2), { viewBox: '0 0 24 24' });
    expect(svg).toContain('stroke="#4C7DFF"');
    expect(svg).not.toContain('<circle');
  });
});
