import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useEnter } from '../../motion/use-enter';
import { usePress } from '../../motion/use-press';
import { GlassSurface } from '../glass-surface/glass-surface';

export interface CardProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Encabezado (por ejemplo, un SectionHeader). */
  header?: ReactNode;
  children?: ReactNode;
  /** Pie (acciones, nota). */
  footer?: ReactNode;
  /** Tarjeta héroe: más padding, esquinas HUD y reflejo en reposo (una por pantalla). */
  hero?: boolean;
  /**
   * Hace la tarjeta presionable (M02); necesita `accessibilityLabel`. Una tarjeta presionable no
   * lleva botones adentro: en web serían un <button> dentro de otro (HTML inválido).
   */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Posición en la entrada escalonada de la pantalla (M01). Sin él, aparece sin animar. */
  enterIndex?: number;
}

/** P06 · Card: GlassSurface (`glass.card`) con encabezado, cuerpo y pie. */
export function Card({
  header,
  children,
  footer,
  hero = false,
  onPress,
  accessibilityLabel,
  enterIndex,
  style,
  testID,
}: CardProps) {
  const surface = (
    <GlassSurface hud={hero} holo={hero ? 'idle' : false} style={styles.surface(hero)}>
      {header}
      {children === undefined ? null : <View style={styles.body}>{children}</View>}
      {footer}
    </GlassSurface>
  );

  const content = onPress ? (
    <PressableCard onPress={onPress} accessibilityLabel={accessibilityLabel}>
      {surface}
    </PressableCard>
  ) : (
    surface
  );

  return enterIndex === undefined ? (
    <View style={style} testID={testID}>
      {content}
    </View>
  ) : (
    <EnterView index={enterIndex} style={style} testID={testID}>
      {content}
    </EnterView>
  );
}

function PressableCard({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string | undefined;
  children: ReactNode;
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePress();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}

function EnterView({
  index,
  children,
  style,
  testID,
}: { index: number; children: ReactNode } & Pick<ViewProps, 'style' | 'testID'>) {
  const enter = useEnter({ index });
  return (
    <Animated.View style={[enter, style]} testID={testID}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  surface: (hero: boolean) => ({
    gap: theme.space[4],
    padding: hero
      ? {
          compact: theme.layout.cardPadding.compact + theme.space[2],
          medium: theme.layout.cardPadding.medium + theme.space[2],
          expanded: theme.layout.cardPadding.expanded + theme.space[2],
        }
      : theme.layout.cardPadding,
  }),
  body: {
    gap: theme.space[3],
  },
}));
