import type { ColorScheme } from '../tokens/color.ts';
import { MODULE_IDS, modulePalettes, type ModuleId } from '../tokens/modules.ts';

import { ENTRANCE_DONE, trailPoint, trailSplit, type EntranceState } from './entrance.ts';
import {
  ANIMATED_MARK_VIEWBOX,
  MARK_VARIANT_MIN_SIZE,
  MARK_VIEWBOX,
  MONO_CUT_WIDTH,
  ORBIT_DOT,
  ORBIT_STROKE,
  PLANET,
  SPARKLE,
  STAR,
  TRAIL,
} from './geometry.ts';
import { moduleIconParts } from './module-icon.ts';
import { ORBIT, orbitFrame, type OrbitSlot } from './orbit.ts';
import { el, scaleAround, type SvgNode, type SvgParts } from './svg-tree.ts';

// BR01 · Logo de Gravyx Ascenda (§11.2–§11.4) como piezas SVG, para un ángulo de órbita y un
// instante de la entrada. Lo dibujan BrandMark (app) y `pnpm brand:export`.

export type BrandMarkVariant = 'animated' | 'icons' | 'dots' | 'mono';

export interface BrandMarkScene {
  variant: BrandMarkVariant;
  /** Fondo sobre el que va el logo (afecta el borde de los puntos de módulo). */
  scheme: ColorScheme;
  /** Prefijo único de ids (dos logos en la misma página no pueden compartirlos). */
  idPrefix: string;
  /** Ángulo de la órbita (M20); por defecto, la pose de reposo φ = 30°. */
  phi?: number;
  /** Estado de la entrada M21; por defecto, terminada. */
  entrance?: EntranceState;
  /** Escala del destello (M23). */
  sparkleScale?: number;
  /** Color de la silueta en `mono`. */
  monoColor?: string;
}

/** Variante según el tamaño en px (§11.4). */
export function brandVariantForSize(size: number): BrandMarkVariant {
  if (size >= MARK_VARIANT_MIN_SIZE.animated) return 'animated';
  if (size >= MARK_VARIANT_MIN_SIZE.icons) return 'icons';
  if (size >= MARK_VARIANT_MIN_SIZE.dots) return 'dots';
  return 'mono';
}

export function markViewBox(variant: BrandMarkVariant): string {
  return variant === 'animated' ? ANIMATED_MARK_VIEWBOX : MARK_VIEWBOX;
}

// Semiplano delantero de la órbita: rectángulo que cubre y ≥ 100 en el sistema de la órbita (−18°).
const frontClip = (id: string) =>
  el('clipPath', { id, clipPathUnits: 'userSpaceOnUse' }, [
    el('rect', {
      x: -100,
      y: 100,
      width: 400,
      height: 200,
      transform: `rotate(${ORBIT.tiltDeg} 100 100)`,
    }),
  ]);

const ringPath = (d: string, stroke: string, width: number, extra: Record<string, string> = {}) =>
  el('path', {
    d,
    fill: 'none',
    stroke,
    strokeWidth: width,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...extra,
  });

const trailNodes = (entrance: EntranceState, color: string, stepColor: string): SvgNode[] => [
  ...(entrance.trailProgress > 0
    ? [ringPath(trailSplit(entrance.trailProgress).path, color, TRAIL.width)]
    : []),
  el(
    'g',
    { opacity: entrance.stepsOpacity, fill: stepColor },
    TRAIL.steps.map((step) => el('circle', { cx: step.x, cy: step.y, r: step.r })),
  ),
];

function starNode(entrance: EntranceState, color: string, glowId?: string): SvgNode {
  const { x, y } = trailPoint(entrance.starProgress);
  return el(
    'g',
    {
      opacity: entrance.starOpacity,
      transform: `translate(${x} ${y}) rotate(${entrance.starRotation}) scale(${entrance.starScale})`,
    },
    [
      ...(glowId ? [el('circle', { r: STAR.glowRadius, fill: `url(#${glowId})` })] : []),
      el('path', { d: STAR.path, fill: color }),
    ],
  );
}

const sparkleNode = (scale: number, color: string) =>
  el('path', {
    d: SPARKLE.path,
    fill: color,
    transform: scaleAround(scale, SPARKLE.cx, SPARKLE.cy),
  });

interface MarkIds {
  planet: string;
  orbit: string;
  front: string;
  glow: string;
  planetClip: string;
}

const markIds = (p: string): MarkIds => ({
  planet: `${p}-planet`,
  orbit: `${p}-orbit`,
  front: `${p}-front`,
  glow: `${p}-glow`,
  planetClip: `${p}-planet-clip`,
});

const planetGradient = (id: string) =>
  el(
    'radialGradient',
    { id, cx: PLANET.gradient.cx, cy: PLANET.gradient.cy, r: PLANET.gradient.r },
    PLANET.gradient.stops.map((stop) => el('stop', { offset: stop.offset, stopColor: stop.color })),
  );

const orbitGradient = (id: string) =>
  el(
    'linearGradient',
    { id, gradientUnits: 'userSpaceOnUse', x1: ORBIT_STROKE.x1, y1: 0, x2: ORBIT_STROKE.x2, y2: 0 },
    ORBIT_STROKE.colors.map((color, index) =>
      el('stop', { offset: index / (ORBIT_STROKE.colors.length - 1), stopColor: color }),
    ),
  );

const glowGradient = (id: string) =>
  el('radialGradient', { id, cx: 0.5, cy: 0.5, r: 0.5 }, [
    el('stop', { offset: 0, stopColor: STAR.glowColor, stopOpacity: 0.6 }),
    el('stop', { offset: 1, stopColor: STAR.glowColor, stopOpacity: 0 }),
  ]);

/** Planeta con su brillo y, durante la entrada, el reflejo que lo cruza. */
function planetNode(entrance: EntranceState, ids: MarkIds, planetR: number): SvgNode {
  const { highlight } = PLANET;
  const sheen =
    entrance.sheenProgress === null
      ? []
      : [
          el('g', { clipPath: `url(#${ids.planetClip})` }, [
            el('rect', {
              x: 30 + 140 * entrance.sheenProgress - 9,
              y: 30,
              width: 18,
              height: 140,
              fill: '#FFFFFF',
              opacity: 0.35,
              transform: `rotate(-20 100 100)`,
            }),
          ]),
        ];
  return el(
    'g',
    {
      opacity: entrance.planetOpacity,
      transform: scaleAround(entrance.planetScale, PLANET.cx, PLANET.cy),
    },
    [
      el('circle', { cx: PLANET.cx, cy: PLANET.cy, r: planetR, fill: `url(#${ids.planet})` }),
      el('ellipse', {
        cx: highlight.cx,
        cy: highlight.cy,
        rx: highlight.rx,
        ry: highlight.ry,
        fill: highlight.color,
        opacity: highlight.opacity,
        transform: `rotate(${highlight.rotate} ${highlight.cx} ${highlight.cy})`,
      }),
      ...sheen,
    ],
  );
}

/** Piezas del logo para una escena. */
export function brandMarkParts(scene: BrandMarkScene): SvgParts {
  if (scene.variant === 'mono') return monoMarkParts(scene);

  const { variant, scheme, idPrefix: p } = scene;
  const entrance = scene.entrance ?? ENTRANCE_DONE;
  const frame = orbitFrame(scene.phi ?? ORBIT.restPhi);
  const dots = variant === 'dots';
  const planetR = dots ? PLANET.dotsR : PLANET.r;
  const ids = markIds(p);

  const icons = dots ? null : cachedIcons(scheme, p);

  const slotNode = (slot: OrbitSlot): SvgNode => {
    if (!icons) {
      return el(
        'circle',
        {
          cx: slot.x,
          cy: slot.y,
          r: ORBIT_DOT.r + ORBIT_DOT.depthR * slot.depth,
          fill: modulePalettes[slot.moduleId][scheme],
          stroke: ORBIT_DOT.border,
          strokeWidth: ORBIT_DOT.borderWidth,
          opacity: slot.opacity,
        },
        [],
        { key: `slot-${slot.moduleId}` },
      );
    }
    const half = slot.size / 2;
    return el(
      'g',
      {
        opacity: slot.opacity,
        transform: `translate(${slot.x - half} ${slot.y - half}) scale(${slot.size / 200})`,
      },
      icons[slot.moduleId].body,
      { key: `slot-${slot.moduleId}` },
    );
  };

  const orbitGroup = (children: readonly SvgNode[], extra: Record<string, string | number> = {}) =>
    el(
      'g',
      {
        opacity: entrance.orbitOpacity,
        transform: scaleAround(entrance.orbitScale, 100, 100),
        ...extra,
      },
      children,
    );

  const defs = cachedDefs(`${variant}|${scheme}|${p}`, () => [
    planetGradient(ids.planet),
    orbitGradient(ids.orbit),
    frontClip(ids.front),
    glowGradient(ids.glow),
    el('clipPath', { id: ids.planetClip }, [
      el('circle', { cx: PLANET.cx, cy: PLANET.cy, r: planetR }),
    ]),
    ...(icons ? MODULE_IDS.flatMap((id) => icons[id].defs) : []),
  ]);

  const ring = (extra: Record<string, string> = {}) =>
    ringPath(frame.ringPath, `url(#${ids.orbit})`, ORBIT_STROKE.width, extra);

  const body: SvgNode[] = [
    orbitGroup([ring({ opacity: String(ORBIT_STROKE.backOpacity) })]),
    orbitGroup(frame.slots.filter((slot) => slot.layer === 'back').map(slotNode)),
    planetNode(entrance, ids, planetR),
    orbitGroup([ring({ clipPath: `url(#${ids.front})` })]),
    orbitGroup(frame.slots.filter((slot) => slot.layer === 'front').map(slotNode)),
    ...trailNodes(entrance, TRAIL.color, TRAIL.stepColor),
    starNode(entrance, STAR.color, ids.glow),
    sparkleNode(scene.sparkleScale ?? entrance.sparkleScale, SPARKLE.color),
  ];

  return { defs, body };
}

/**
 * Capas del logo con íconos (variantes `animated` e `icons`) ya terminada la entrada, para moverlo
 * en el hilo de UI (F1.9): lo fijo va en SVG que no se vuelven a dibujar (planeta; estela y
 * estrella) y lo que se mueve va aparte. El trazo de la órbita trae sus atributos sin `d`, que
 * calcula el worklet de `orbitFrame`; los íconos van en vistas que se mueven con `transform`; el
 * destello va a escala 1 y se escala la vista. Cada capa es un `<Svg>` propio, con sus `defs`.
 */
export interface BrandMarkLayers {
  /** `defs` del trazo: degradado y recorte del semiplano delantero. */
  ringDefs: SvgNode[];
  /** Atributos del trazo de la órbita (sin `d`). */
  ringAttrs: Record<string, string | number>;
  /** Opacidad del trazo de atrás. */
  ringBackOpacity: number;
  /** `url(#…)` del recorte del trazo de adelante. */
  ringFrontClip: string;
  planet: SvgParts;
  /** Estela y estrella. */
  overlay: SvgParts;
  sparkle: SvgNode;
  icons: Record<ModuleId, SvgParts>;
}

export function brandMarkLayers(scheme: ColorScheme, idPrefix: string): BrandMarkLayers {
  return remember(layersCache, `${scheme}|${idPrefix}`, () => {
    const ids = markIds(idPrefix);
    return {
      ringDefs: [orbitGradient(ids.orbit), frontClip(ids.front)],
      ringAttrs: {
        fill: 'none',
        stroke: `url(#${ids.orbit})`,
        strokeWidth: ORBIT_STROKE.width,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      ringBackOpacity: ORBIT_STROKE.backOpacity,
      ringFrontClip: `url(#${ids.front})`,
      planet: {
        defs: [planetGradient(ids.planet)],
        body: [planetNode(ENTRANCE_DONE, ids, PLANET.r)],
      },
      overlay: {
        defs: [glowGradient(ids.glow)],
        body: [
          ...trailNodes(ENTRANCE_DONE, TRAIL.color, TRAIL.stepColor),
          starNode(ENTRANCE_DONE, STAR.color, ids.glow),
        ],
      },
      sparkle: sparkleNode(1, SPARKLE.color),
      icons: cachedIcons(scheme, idPrefix),
    };
  });
}

// Piezas fijas del logo animado, reutilizadas entre cuadros: los cuerpos de los íconos de módulo y
// los `defs` no cambian con la órbita. Con los mismos objetos, React salta esos subárboles en cada
// cuadro (SvgPartsView memoriza por nodo) y solo procesa los grupos que se mueven (F1.9, Android).
const PARTS_CACHE_LIMIT = 48;
const iconsCache = new Map<string, Record<ModuleId, SvgParts>>();
const defsCache = new Map<string, SvgNode[]>();
const layersCache = new Map<string, BrandMarkLayers>();

function remember<T>(cache: Map<string, T>, key: string, build: () => T): T {
  const hit = cache.get(key);
  if (hit) return hit;
  const value = build();
  // Tope simple: cada logo montado usa una clave; al pasarlo se descarta la más vieja.
  if (cache.size >= PARTS_CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
  return value;
}

function cachedIcons(scheme: BrandMarkScene['scheme'], prefix: string) {
  return remember(
    iconsCache,
    `${scheme}|${prefix}`,
    () =>
      Object.fromEntries(
        MODULE_IDS.map((id) => [id, moduleIconParts(id, scheme, `${prefix}-${id}`)] as const),
      ) as Record<ModuleId, SvgParts>,
  );
}

function cachedDefs(key: string, build: () => SvgNode[]): SvgNode[] {
  return remember(defsCache, key, build);
}

// Monocromo (§11.4): silueta de un color. Donde la órbita pasa por delante, una máscara recorta el
// planeta alrededor del trazo (queda transparente, sirve sobre cualquier fondo).
function monoMarkParts(scene: BrandMarkScene): SvgParts {
  const color = scene.monoColor ?? '#FFFFFF';
  const p = scene.idPrefix;
  const frame = orbitFrame(scene.phi ?? ORBIT.restPhi);
  const ids = { front: `${p}-front`, cut: `${p}-cut` };

  return {
    defs: [
      frontClip(ids.front),
      el(
        'mask',
        { id: ids.cut, maskUnits: 'userSpaceOnUse', x: -50, y: -50, width: 300, height: 300 },
        [
          el('rect', { x: -50, y: -50, width: 300, height: 300, fill: '#FFFFFF' }),
          ringPath(frame.ringPath, '#000000', MONO_CUT_WIDTH, { clipPath: `url(#${ids.front})` }),
        ],
      ),
    ],
    body: [
      ringPath(frame.ringPath, color, ORBIT_STROKE.width),
      el('circle', {
        cx: PLANET.cx,
        cy: PLANET.cy,
        r: PLANET.r,
        fill: color,
        mask: `url(#${ids.cut})`,
      }),
      ringPath(frame.ringPath, color, ORBIT_STROKE.width, { clipPath: `url(#${ids.front})` }),
      el(
        'g',
        { fill: color },
        frame.slots.map((slot) => el('circle', { cx: slot.x, cy: slot.y, r: ORBIT_DOT.r })),
      ),
      ...trailNodes(ENTRANCE_DONE, color, color),
      starNode(ENTRANCE_DONE, color),
      sparkleNode(1, color),
    ],
  };
}
