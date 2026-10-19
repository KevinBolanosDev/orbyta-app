import type { LucideIcon } from 'lucide-react-native';
import { createContext, use, type ReactNode } from 'react';
import { View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import { ICON_STROKE_WIDTH, iconSize } from '../../tokens';
import type { TextTone } from '../text/text';

/** Un ícono de Lucide, importado uno por uno (`lucide-react-native/icons/<nombre>`, ADR 0015). */
export type IconComponent = LucideIcon;

/** 16 en línea · 20 en listas · 24 en navegación y botones · 32 en estados vacíos (§2.9). */
export type IconSize = keyof typeof iconSize;

const IconColorContext = createContext<string | undefined>(undefined);

/**
 * Color que heredan los íconos de adentro (React Native no tiene `currentColor`). Lo ponen
 * Button, IconButton y Chip con el color de su texto.
 */
export function IconColorProvider({ color, children }: { color: string; children: ReactNode }) {
  return <IconColorContext value={color}>{children}</IconColorContext>;
}

export interface IconProps {
  icon: IconComponent;
  size?: IconSize;
  /** Color explícito. Si no, el tono; si no, el heredado; si no, `color.ink`. */
  color?: string;
  tone?: TextTone;
  /** Nombre accesible. Sin él, el ícono es decorativo (lo describe el texto de al lado). */
  accessibilityLabel?: string;
  testID?: string;
}

/** Resuelve un tono de texto a su color del tema. */
export function useToneColor(tone: TextTone | undefined): string | undefined {
  const { theme } = useUnistyles();
  if (tone === undefined) return undefined;
  const map: Record<TextTone, string> = {
    default: theme.colors.ink,
    muted: theme.colors.inkMuted,
    subtle: theme.colors.inkSubtle,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    gain: theme.colors.gain,
    loss: theme.colors.loss,
    warning: theme.colors.warning,
    onPrimary: theme.colors.onPrimary,
    onHolo: theme.holo.ink,
  };
  return map[tone];
}

/** P02 · Icon: ícono de trazo de 2 px de Lucide con los tamaños de §2.9 y color heredado. */
export function Icon({
  icon: Glyph,
  size = 'nav',
  color,
  tone,
  accessibilityLabel,
  testID,
}: IconProps) {
  const { theme } = useUnistyles();
  const inherited = use(IconColorContext);
  const toneColor = useToneColor(tone);
  const glyph = (
    // Sin props de accesibilidad: Lucide ya marca su SVG como `aria-hidden`, y en web
    // react-native-svg pasaría `accessibilityElementsHidden` tal cual a la etiqueta <svg>.
    <Glyph
      size={iconSize[size]}
      color={color ?? toneColor ?? inherited ?? theme.colors.ink}
      strokeWidth={ICON_STROKE_WIDTH}
      {...(testID && !accessibilityLabel ? { testID } : {})}
    />
  );
  // Lucide oculta su SVG al lector de pantalla: el nombre va en una View que lo envuelve.
  return accessibilityLabel ? (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {glyph}
    </View>
  ) : (
    glyph
  );
}
