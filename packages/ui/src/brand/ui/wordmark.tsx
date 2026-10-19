import { Text as NativeText, View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { fontFamily } from '../../tokens';
import { LOCKUP, WORDMARK } from '../geometry';

import { BrandMark } from './brand-mark';

export interface WordmarkProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Alto de letra en px (por defecto 24). */
  size?: number;
  /** Separación entre "GRAVYX" y "ASCENDA"; por defecto, la proporción del logotipo. */
  gap?: number;
  /** Por defecto, `color.ink` del tema. */
  color?: string;
  /** Nombre accesible (`brand.name`). Sin él, es decorativo. */
  accessibilityLabel?: string;
}

/**
 * BR03 · Wordmark: "GRAVYX" en Michroma y "ASCENDA" en Exo 2 delgada con tracking amplio (§11.1).
 * Solo para la marca, nunca para texto de la UI. No crece con el texto dinámico: es un logo.
 */
export function Wordmark({
  size = 24,
  gap,
  color,
  accessibilityLabel,
  style,
  testID,
}: WordmarkProps) {
  const label = accessibilityLabel
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
    : {
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
      };
  const space = gap ?? (size * LOCKUP.gap) / LOCKUP.wordSize;
  return (
    <View {...label} style={[styles.row(space), style]} testID={testID}>
      <NativeText allowFontScaling={false} style={styles.word('primary', size, color)}>
        {WORDMARK.primary}
      </NativeText>
      <NativeText allowFontScaling={false} style={styles.word('secondary', size, color)}>
        {WORDMARK.secondary}
      </NativeText>
    </View>
  );
}

export interface BrandLockupProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Alto del símbolo en px (por defecto 48); las palabras miden el 40 % y la separación el 25 %. */
  height?: number;
  /** Variante del símbolo; por defecto, según el alto. */
  variant?: 'auto' | 'icons' | 'dots' | 'mono';
  color?: string;
  /** Nombre accesible (`brand.name`). */
  accessibilityLabel: string;
}

/** BR04 · Logotipo horizontal: símbolo + "GRAVYX" + "ASCENDA" (§11.4). El símbolo no se anima. */
export function BrandLockup({
  height = 48,
  variant = 'auto',
  color,
  accessibilityLabel,
  style,
  testID,
}: BrandLockupProps) {
  const gap = height * LOCKUP.gap;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.row(gap), style]}
      testID={testID}
    >
      <BrandMark size={height} variant={variant === 'auto' && height >= 160 ? 'icons' : variant} />
      <Wordmark size={height * LOCKUP.wordSize} gap={gap} {...(color ? { color } : {})} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: (gap: number) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap,
  }),
  word: (kind: 'primary' | 'secondary', size: number, color: string | undefined) => ({
    fontFamily: kind === 'primary' ? fontFamily.brand : fontFamily.brandThin,
    fontSize: size,
    lineHeight: size * 1.2,
    letterSpacing: size * (kind === 'primary' ? LOCKUP.brandTracking : LOCKUP.thinTracking),
    color: color ?? theme.colors.ink,
  }),
}));
