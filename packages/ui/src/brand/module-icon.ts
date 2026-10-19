import { modulePalettes, type ModuleId } from '../tokens/modules.ts';

import { MODULE_ICON } from './geometry.ts';
import { MODULE_GLYPHS } from './glyphs.ts';
import { el, type SvgNode, type SvgParts } from './svg-tree.ts';

// BR02 · Ícono de módulo (§11.5): planeta de cristal en el color del módulo, órbita hexagonal plana,
// glifo oscuro y punto en el vértice. Lienzo de 200 × 200.

/** `dark`/`light`: a color sobre ese fondo. `mono`: silueta de un color (notificaciones). */
export type ModuleIconTone = 'dark' | 'light' | 'mono';

const { orbitPath, orbitWidth, planet, highlight, glyph, dot } = MODULE_ICON;

const GLYPH_SCALE = glyph.size / glyph.viewBox;
const GLYPH_OFFSET = 100 - glyph.size / 2;

function glyphGroup(moduleId: ModuleId, color: string): SvgNode {
  return el(
    'g',
    {
      transform: `translate(${GLYPH_OFFSET} ${GLYPH_OFFSET}) scale(${GLYPH_SCALE})`,
      fill: 'none',
      stroke: color,
      strokeWidth: glyph.strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    MODULE_GLYPHS[moduleId].map((d) => el('path', { d })),
  );
}

const orbitStroke = (color: string, attrs: Record<string, string> = {}) =>
  el('path', {
    d: orbitPath,
    fill: 'none',
    stroke: color,
    strokeWidth: orbitWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...attrs,
  });

/** Piezas del ícono de un módulo. `idPrefix` hace únicos los ids de degradados y máscaras. */
export function moduleIconParts(
  moduleId: ModuleId,
  tone: ModuleIconTone,
  idPrefix: string,
  monoColor = '#FFFFFF',
): SvgParts {
  if (tone === 'mono') return monoModuleIconParts(moduleId, idPrefix, monoColor);

  const palette = modulePalettes[moduleId];
  const color = palette[tone];
  const gradientId = `${idPrefix}-planet`;
  return {
    defs: [
      el(
        'radialGradient',
        { id: gradientId, cx: planet.gradient.cx, cy: planet.gradient.cy, r: planet.gradient.r },
        [
          el('stop', { offset: 0, stopColor: palette.tint }),
          el('stop', { offset: planet.gradient.mid, stopColor: palette.planet }),
          el('stop', { offset: 1, stopColor: palette.shade }),
        ],
      ),
    ],
    body: [
      orbitStroke(color),
      el('circle', { cx: planet.cx, cy: planet.cy, r: planet.r, fill: `url(#${gradientId})` }),
      el('ellipse', {
        cx: highlight.cx,
        cy: highlight.cy,
        rx: highlight.rx,
        ry: highlight.ry,
        fill: highlight.color,
        opacity: highlight.opacity,
        transform: `rotate(${highlight.rotate} ${highlight.cx} ${highlight.cy})`,
      }),
      glyphGroup(moduleId, glyph.color),
      el('circle', {
        cx: dot.cx,
        cy: dot.cy,
        r: dot.r,
        fill: color,
        stroke: dot.border[tone],
        strokeWidth: dot.borderWidth,
      }),
    ],
  };
}

// Silueta de un color: el glifo y el borde del punto se recortan con máscaras (quedan transparentes).
function monoModuleIconParts(moduleId: ModuleId, idPrefix: string, color: string): SvgParts {
  const glyphCut = `${idPrefix}-glyph-cut`;
  const dotCut = `${idPrefix}-dot-cut`;
  const fullArea = el('rect', { x: 0, y: 0, width: 200, height: 200, fill: '#FFFFFF' });
  return {
    defs: [
      el(
        'mask',
        { id: glyphCut, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 200, height: 200 },
        [fullArea, glyphGroup(moduleId, '#000000')],
      ),
      el('mask', { id: dotCut, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 200, height: 200 }, [
        fullArea,
        el('circle', { cx: dot.cx, cy: dot.cy, r: dot.r + dot.borderWidth, fill: '#000000' }),
      ]),
    ],
    body: [
      el('g', { mask: `url(#${dotCut})` }, [orbitStroke(color)]),
      el('circle', {
        cx: planet.cx,
        cy: planet.cy,
        r: planet.r,
        fill: color,
        mask: `url(#${glyphCut})`,
      }),
      el('circle', { cx: dot.cx, cy: dot.cy, r: dot.r, fill: color }),
    ],
  };
}

/** Solo el glifo (caja de 24), para tamaños menores al mínimo del ícono (§11.5). */
export function moduleGlyphParts(moduleId: ModuleId, color: string, strokeWidth: number): SvgParts {
  return {
    defs: [],
    body: [
      el(
        'g',
        {
          fill: 'none',
          stroke: color,
          strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        MODULE_GLYPHS[moduleId].map((d) => el('path', { d })),
      ),
    ],
  };
}
