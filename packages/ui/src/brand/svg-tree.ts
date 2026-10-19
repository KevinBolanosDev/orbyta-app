// Dibujo de la marca como datos: un árbol SVG neutral que se pinta de dos formas, con
// react-native-svg en la app (SvgTreeNodes) y como texto en `pnpm brand:export`. Así el logo de la
// app y los archivos exportados salen de la misma función y no se desalinean (§11.8).
// Este módulo y los demás del núcleo de brand/ usan imports con `.ts`: Node los ejecuta tal cual.

export type SvgTag =
  | 'svg'
  | 'g'
  | 'path'
  | 'circle'
  | 'ellipse'
  | 'rect'
  | 'defs'
  | 'linearGradient'
  | 'radialGradient'
  | 'stop'
  | 'clipPath'
  | 'mask'
  | 'text'
  | 'style';

export type SvgAttrs = Readonly<Record<string, string | number | undefined>>;

export interface SvgNode {
  tag: SvgTag;
  attrs: SvgAttrs;
  children: readonly SvgNode[];
  /** Contenido de texto (`text`, `style`). */
  text?: string;
  /** Clave estable para React cuando un nodo cambia de lugar entre cuadros (íconos de la órbita). */
  key?: string;
}

/** Una pieza de dibujo: definiciones (degradados, máscaras) y lo que se pinta. */
export interface SvgParts {
  defs: readonly SvgNode[];
  body: readonly SvgNode[];
}

export function el(
  tag: SvgTag,
  attrs: SvgAttrs = {},
  children: readonly SvgNode[] = [],
  extra: Pick<SvgNode, 'text' | 'key'> = {},
): SvgNode {
  return { tag, attrs, children, ...extra };
}

/** Une varias piezas en una sola. */
export function mergeParts(...parts: readonly SvgParts[]): SvgParts {
  return {
    defs: parts.flatMap((part) => part.defs),
    body: parts.flatMap((part) => part.body),
  };
}

/** Redondeo para coordenadas y trazos (0,1 de unidad en un lienzo de 200). */
export function round1(value: number): number {
  return Math.round(value * 10) / 10 + 0;
}

/** `transform` que escala alrededor de un punto. */
export function scaleAround(scale: number, cx: number, cy: number): string {
  return `translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`;
}

// Atributos que SVG escribe en camelCase; el resto se pasa a kebab-case (strokeWidth → stroke-width).
const CAMEL_CASE_ATTRS = new Set([
  'viewBox',
  'gradientUnits',
  'gradientTransform',
  'maskUnits',
  'maskContentUnits',
  'clipPathUnits',
  'preserveAspectRatio',
  'textLength',
  'lengthAdjust',
]);

const toAttrName = (name: string) =>
  CAMEL_CASE_ATTRS.has(name) ? name : name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const formatValue = (value: string | number) =>
  typeof value === 'number' ? String(Math.round(value * 1000) / 1000 + 0) : escapeXml(value);

/** Serializa un nodo como texto SVG. */
export function renderSvgString(node: SvgNode): string {
  const attrs = Object.entries(node.attrs)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .map(([name, value]) => ` ${toAttrName(name)}="${formatValue(value)}"`)
    .join('');
  const content =
    node.tag === 'style'
      ? (node.text ?? '')
      : escapeXml(node.text ?? '') + node.children.map(renderSvgString).join('');
  return content === ''
    ? `<${node.tag}${attrs}/>`
    : `<${node.tag}${attrs}>${content}</${node.tag}>`;
}

/** Documento SVG completo a partir de piezas. */
export function svgDocument(
  parts: SvgParts,
  { viewBox, width, height }: { viewBox: string; width?: number; height?: number },
): string {
  const root = el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox, width, height }, [
    ...(parts.defs.length > 0 ? [el('defs', {}, parts.defs)] : []),
    ...parts.body,
  ]);
  return `${renderSvgString(root)}\n`;
}
