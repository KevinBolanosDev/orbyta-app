import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import {
  fontFamily,
  MAX_FONT_SCALE,
  typeScale,
  type TypeStyleToken,
  type TypeVariant,
} from '../../tokens';

/** P01 · Tonos de color del texto (design-system.md §7.1). */
export type TextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'gain'
  | 'loss'
  | 'warning'
  | 'onPrimary';

export interface TextProps extends NativeTextProps {
  /** Rol tipográfico (`type.<rol>`). Por defecto `bodyM`. */
  variant?: TypeVariant;
  tone?: TextTone;
}

/**
 * P01 · Text. Aplica la escala tipográfica (tamaño de móvil en `compact` y de tablet/web desde
 * `medium`), cifras tabulares en los roles numéricos y un tope de 1,3× al texto dinámico.
 * No tiene textos propios: el contenido llega como `children` desde @repo/i18n.
 */
export function Text({
  variant = 'bodyM',
  tone = 'default',
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  style,
  ...rest
}: TextProps) {
  // En Unistyles `default` es una clave reservada: se aplica cuando la variante es `undefined`.
  styles.useVariants({ variant, tone: tone === 'default' ? undefined : tone });
  return (
    <NativeText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[styles.text, style]}
      {...rest}
    />
  );
}

/** Estilo de un rol tipográfico, con tamaños por breakpoint. */
function toTextStyle(token: TypeStyleToken) {
  return {
    fontFamily: fontFamily[token.family],
    fontSize: { compact: token.compact.fontSize, medium: token.wide.fontSize },
    lineHeight: { compact: token.compact.lineHeight, medium: token.wide.lineHeight },
    ...(token.letterSpacingEm === undefined
      ? {}
      : { letterSpacing: token.letterSpacingEm * token.compact.fontSize }),
    ...(token.uppercase ? { textTransform: 'uppercase' as const } : {}),
    ...(token.tabularNums ? { fontVariant: ['tabular-nums' as const] } : {}),
  };
}

const typeVariants = Object.fromEntries(
  (Object.keys(typeScale) as TypeVariant[]).map((name) => [name, toTextStyle(typeScale[name])]),
) as Record<TypeVariant, ReturnType<typeof toTextStyle>>;

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.ink,
    variants: {
      variant: typeVariants,
      tone: {
        default: { color: theme.colors.ink },
        muted: { color: theme.colors.inkMuted },
        subtle: { color: theme.colors.inkSubtle },
        primary: { color: theme.colors.primary },
        secondary: { color: theme.colors.secondary },
        accent: { color: theme.colors.accent },
        gain: { color: theme.colors.gain },
        loss: { color: theme.colors.loss },
        warning: { color: theme.colors.warning },
        onPrimary: { color: theme.colors.onPrimary },
      },
    },
  },
}));
