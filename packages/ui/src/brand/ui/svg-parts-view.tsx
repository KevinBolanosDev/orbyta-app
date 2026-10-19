import type { ComponentType, ReactNode } from 'react';
import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { SvgNode, SvgParts, SvgTag } from '../svg-tree';

type SvgComponent = ComponentType<Record<string, unknown> & { children?: ReactNode }>;

// Las clases de react-native-svg con props obligatorias (d, cx…) se ven como componentes genéricos:
// las props salen del árbol, que el núcleo de brand/ ya arma con lo que cada etiqueta necesita.
const generic = (component: unknown) => component as SvgComponent;

// Cada etiqueta del árbol con su componente de react-native-svg. `svg`, `text` y `style` solo se
// usan en el export (la raíz la pone el componente y el texto de la app va con <Text> de RN).
const COMPONENTS: Partial<Record<SvgTag, SvgComponent>> = {
  g: G,
  path: generic(Path),
  circle: generic(Circle),
  ellipse: generic(Ellipse),
  rect: generic(Rect),
  defs: Defs,
  linearGradient: generic(LinearGradient),
  radialGradient: generic(RadialGradient),
  stop: generic(Stop),
  clipPath: ClipPath,
  mask: Mask,
};

function renderNode(node: SvgNode, index: number): ReactNode {
  const Component = COMPONENTS[node.tag];
  if (!Component) return null;
  return (
    <Component key={node.key ?? index} {...node.attrs}>
      {node.children.length > 0 ? node.children.map(renderNode) : undefined}
    </Component>
  );
}

/** Pinta piezas del árbol SVG de la marca dentro de un `<Svg>` de react-native-svg. */
export function SvgPartsView({ parts }: { parts: SvgParts }) {
  return (
    <>
      {parts.defs.length > 0 ? <Defs>{parts.defs.map(renderNode)}</Defs> : null}
      {parts.body.map(renderNode)}
    </>
  );
}
