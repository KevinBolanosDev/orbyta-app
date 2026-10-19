// pnpm brand:export — genera los assets de marca de design-system.md §11.8 en assets/brand/.
// Todo sale de las mismas funciones que dibujan el logo en la app (src/brand), así los archivos y la
// animación nunca se desalinean. Corre en Node 24 sin compilar; los PNG se rasterizan con resvg.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import resvg from '@resvg/resvg-js';

import { APP_ICON, LOCKUP, MARK_CLEAR_SPACE, WORDMARK } from '../src/brand/geometry.ts';
import { brandMarkParts, markViewBox, type BrandMarkScene } from '../src/brand/mark.ts';
import { moduleIconParts, type ModuleIconTone } from '../src/brand/module-icon.ts';
import { el, svgDocument, type SvgNode, type SvgParts } from '../src/brand/svg-tree.ts';
import { cssAngleToSvgVector } from '../src/lib/gradient.ts';
import { semanticColors, type ColorScheme } from '../src/tokens/color.ts';
import { MODULE_IDS } from '../src/tokens/modules.ts';

import { readFontMetrics, textWidth } from './font-metrics.ts';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'assets', 'brand');
const require = createRequire(import.meta.url);

const written: string[] = [];

function write(relativePath: string, content: string | Uint8Array) {
  const target = join(OUT, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  written.push(relativePath);
}

const writeSvg = (name: string, svg: string) => {
  write(name, svg);
};

function writePng(name: string, svg: string, width: number) {
  const png = new resvg.Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
  write(name, png);
}

const mark = (scene: Omit<BrandMarkScene, 'idPrefix'> & { idPrefix?: string }): SvgParts =>
  brandMarkParts({ idPrefix: 'gx', ...scene });

/** Coloca piezas dibujadas en un lienzo de 200 × 200 en (x, y) con un lado de `size`. */
function place(parts: SvgParts, x: number, y: number, size: number): SvgParts {
  return {
    defs: parts.defs,
    body: [el('g', { transform: `translate(${x} ${y}) scale(${size / 200})` }, parts.body)],
  };
}

/** Fondo del ícono de la app: `linear-gradient(160°, #141A3A, #060A16)`. */
function iconBackground(size: number): SvgParts {
  const vector = cssAngleToSvgVector(APP_ICON.angleDeg);
  return {
    defs: [
      el('linearGradient', { id: 'icon-bg', ...vector }, [
        el('stop', { offset: 0, stopColor: APP_ICON.from }),
        el('stop', { offset: 1, stopColor: APP_ICON.to }),
      ]),
    ],
    body: [el('rect', { x: 0, y: 0, width: size, height: size, fill: 'url(#icon-bg)' })],
  };
}

const stack = (...parts: SvgParts[]): SvgParts => ({
  defs: parts.flatMap((part) => part.defs),
  body: parts.flatMap((part) => part.body),
});

/** Logo centrado en un lienzo cuadrado, ocupando `ratio` del lado. */
const centeredMark = (canvas: number, ratio: number, scene: Omit<BrandMarkScene, 'idPrefix'>) => {
  const size = canvas * ratio;
  return place(mark(scene), (canvas - size) / 2, (canvas - size) / 2, size);
};

const squareDoc = (parts: SvgParts, size: number) =>
  svgDocument(parts, { viewBox: `0 0 ${size} ${size}`, width: size, height: size });

// 1. Logo: con íconos, con puntos y monocromo (pose de reposo).
for (const variant of ['icons', 'dots', 'mono'] as const) {
  writeSvg(
    `gravyx-ascenda-mark-${variant}.svg`,
    svgDocument(mark({ variant, scheme: 'dark' }), { viewBox: markViewBox(variant) }),
  );
}

// 2. Íconos de módulo: 5 × (oscuro, claro, monocromo).
for (const moduleId of MODULE_IDS) {
  for (const tone of ['dark', 'light', 'mono'] as const satisfies readonly ModuleIconTone[]) {
    writeSvg(
      `module-${moduleId}-${tone}.svg`,
      svgDocument(moduleIconParts(moduleId, tone, `m-${moduleId}`), { viewBox: '0 0 200 200' }),
    );
  }
}

// 3. Logotipo horizontal (BR04) con las fuentes embebidas: se ve igual en cualquier visor.
const fonts = {
  primary: {
    family: 'Michroma',
    weight: 400,
    file: readFileSync(
      require.resolve('@expo-google-fonts/michroma/400Regular/Michroma_400Regular.ttf'),
    ),
  },
  secondary: {
    family: 'Exo 2',
    weight: 200,
    file: readFileSync(
      require.resolve('@expo-google-fonts/exo-2/200ExtraLight/Exo2_200ExtraLight.ttf'),
    ),
  },
} as const;

function lockup(scheme: ColorScheme): string {
  const height = 200;
  const gap = height * LOCKUP.gap;
  const fontSize = height * LOCKUP.wordSize;
  const color = semanticColors[scheme].ink;
  const words = [
    { text: WORDMARK.primary, font: fonts.primary, tracking: LOCKUP.brandTracking },
    { text: WORDMARK.secondary, font: fonts.secondary, tracking: LOCKUP.thinTracking },
  ].map((word) => {
    const metrics = readFontMetrics(word.font.file);
    const spacing = fontSize * word.tracking;
    return {
      ...word,
      spacing,
      width: textWidth(metrics, word.text, fontSize, spacing),
      capHeight: (metrics.capHeight * fontSize) / metrics.unitsPerEm,
    };
  });

  let x = height + gap;
  const texts: SvgNode[] = words.map((word) => {
    const node = el(
      'text',
      {
        x,
        y: height / 2 + word.capHeight / 2,
        fontFamily: `'${word.font.family}'`,
        fontWeight: word.font.weight,
        fontSize,
        letterSpacing: word.spacing,
        fill: color,
      },
      [],
      { text: word.text },
    );
    x += word.width + gap;
    return node;
  });
  // Los visores también aplican el tracking después de la última letra.
  const width = Math.ceil(x - gap + (words.at(-1)?.spacing ?? 0));

  const fontFaces = words
    .map(
      ({ font }) =>
        `@font-face{font-family:'${font.family}';font-weight:${font.weight};` +
        `src:url(data:font/ttf;base64,${font.file.toString('base64')}) format('truetype');}`,
    )
    .join('');

  return svgDocument(
    stack(
      { defs: [el('style', {}, [], { text: fontFaces })], body: [] },
      mark({ variant: 'icons', scheme }),
      { defs: [], body: texts },
    ),
    { viewBox: `0 0 ${width} ${height}`, width, height },
  );
}

for (const scheme of ['dark', 'light'] as const) {
  writeSvg(`gravyx-ascenda-lockup-${scheme}.svg`, lockup(scheme));
}

// 4. Ícono de la app 1024: fondo degradado + logo con íconos al 88 %.
const appIcon = squareDoc(
  stack(
    iconBackground(1024),
    centeredMark(1024, APP_ICON.markScale, { variant: 'icons', scheme: 'dark' }),
  ),
  1024,
);
writePng('app-icon-1024.png', appIcon, 1024);

// 5. Android adaptativo (108 dp a 4×): el logo dentro de la zona segura de 66/108.
const ADAPTIVE = 432;
const SAFE_ZONE = 66 / 108;
writePng(
  'android-adaptive/foreground.png',
  squareDoc(centeredMark(ADAPTIVE, SAFE_ZONE, { variant: 'icons', scheme: 'dark' }), ADAPTIVE),
  ADAPTIVE,
);
writePng(
  'android-adaptive/background.png',
  squareDoc(iconBackground(ADAPTIVE), ADAPTIVE),
  ADAPTIVE,
);
writePng(
  'android-adaptive/monochrome.png',
  squareDoc(centeredMark(ADAPTIVE, SAFE_ZONE, { variant: 'mono', scheme: 'dark' }), ADAPTIVE),
  ADAPTIVE,
);

// 6. PWA: íconos 192/512, maskable (logo dentro del círculo seguro) y favicon.
writePng('pwa/icon-192.png', appIcon, 192);
writePng('pwa/icon-512.png', appIcon, 512);
writePng(
  'pwa/maskable-512.png',
  squareDoc(
    stack(iconBackground(512), centeredMark(512, SAFE_ZONE, { variant: 'icons', scheme: 'dark' })),
    512,
  ),
  512,
);
// El favicon SVG sigue el tema del navegador; los PNG de respaldo van en el color de tinta claro.
const faviconParts = mark({ variant: 'mono', scheme: 'dark', monoColor: 'currentColor' });
const faviconStyle = el('style', {}, [], {
  text:
    `svg{color:${semanticColors.light.ink}}` +
    `@media (prefers-color-scheme:dark){svg{color:${semanticColors.dark.ink}}}`,
});
writeSvg(
  'pwa/favicon.svg',
  svgDocument(stack({ defs: [faviconStyle], body: [] }, faviconParts), { viewBox: '0 0 200 200' }),
);
const faviconPng = svgDocument(
  mark({ variant: 'mono', scheme: 'light', monoColor: semanticColors.light.ink }),
  { viewBox: '0 0 200 200' },
);
writePng('pwa/favicon-32.png', faviconPng, 32);
writePng('pwa/favicon-16.png', faviconPng, 16);

// 7. Splash: respaldo estático del logo animado, con su zona de respeto.
const SPLASH_RATIO = 200 / (200 + 2 * MARK_CLEAR_SPACE);
writePng(
  'splash/splash-icon.png',
  squareDoc(centeredMark(1024, SPLASH_RATIO, { variant: 'icons', scheme: 'dark' }), 1024),
  1024,
);

// Resumen en la terminal (stdout: el lint solo permite console.warn/error).
const summary = [`brand:export → ${written.length} archivos en assets/brand/`];
for (const file of written) summary.push(`  ${file}`);
process.stdout.write(`${summary.join('\n')}\n`);
