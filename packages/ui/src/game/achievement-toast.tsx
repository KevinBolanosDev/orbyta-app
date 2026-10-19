import Trophy from 'lucide-react-native/icons/trophy';
import X from 'lucide-react-native/icons/x';
import { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useReduceMotion } from '../motion/accessibility-preferences';
import { springConfig, timingConfig } from '../motion/easing';
import { triggerHaptic } from '../motion/haptics';
import { settledOpacity } from '../motion/motion-math';
import { GlassSurface } from '../primitives/glass-surface/glass-surface';
import { GradientFill } from '../primitives/gradient-fill/gradient-fill';
import { Icon, type IconComponent } from '../primitives/icon/icon';
import { IconButton } from '../primitives/icon-button/icon-button';
import { Text } from '../primitives/text/text';
import { componentSize, duration, holoGradient, radius, spring } from '../tokens';

export interface AchievementToastProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** "LOGRO DESBLOQUEADO". */
  overline: string;
  title: string;
  /** "+50 XP". */
  xp?: string;
  icon?: IconComponent;
  /** Fundido de entrada y salida cuando lo maneja el ToastProvider (ver GlassSurface `fade`). */
  fade?: SharedValue<number>;
  onDismiss?: () => void;
  /** Nombre accesible del × ("Descartar"). */
  dismissLabel?: string;
}

/** M07: de dónde llega la tarjeta. */
const ENTER_OFFSET = 30;
const ENTER_SCALE = 0.85;
/** M07: el "+XP" entra grande y se asienta. */
const XP_FROM_SCALE = 1.6;

/**
 * X05 · AchievementToast: ícono holo, "LOGRO DESBLOQUEADO", título y "+XP". Entra con M07: sube
 * 30 px y crece de 0,85 a 1 con el resorte de recompensa (`elastic.out`), el glow late una vez,
 * el "+XP" se asienta desde 1,6 y lo cruza el reflejo M08. Háptica de éxito al aparecer.
 * Se muestra con `useToast().show({ achievement })` o suelto. Con "reducir movimiento", solo fundido.
 */
export function AchievementToast({
  overline,
  title,
  xp,
  icon = Trophy,
  fade,
  onDismiss,
  dismissLabel,
  style,
  testID,
}: AchievementToastProps) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const enter = useSharedValue(reduceMotion ? 1 : 0);
  const xpScale = useSharedValue(reduceMotion ? 1 : XP_FROM_SCALE);
  const glow = useSharedValue(0);

  useEffect(() => {
    triggerHaptic('success');
    if (reduceMotion) return;
    const reward = springConfig(spring.reward);
    enter.set(withSpring(1, reward));
    xpScale.set(withDelay(duration.fast, withSpring(1, reward)));
    glow.set(
      withSequence(
        withTiming(1, timingConfig(duration.base, 'power2Out')),
        withTiming(0.35, timingConfig(duration.slow, 'sineInOut')),
      ),
    );
  }, [enter, glow, reduceMotion, xpScale]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - enter.get()) * ENTER_OFFSET },
      { scale: ENTER_SCALE + (1 - ENTER_SCALE) * enter.get() },
    ],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.get() }));
  const xpStyle = useAnimatedStyle(() => ({ transform: [{ scale: xpScale.get() }] }));
  // Sin `fade` (suelto) el contenido ya está visible; con `fade` se desvanece aparte del vidrio.
  const contentStyle = useAnimatedStyle(() => ({
    opacity: fade ? settledOpacity(fade.get()) : 1,
  }));

  const announcement = [overline, title, xp].filter(Boolean).join(', ');

  return (
    <Animated.View style={[styles.root, cardStyle, style]} testID={testID}>
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />
      <GlassSurface level="sheet" cornerRadius={radius.l} holo="manual" {...(fade ? { fade } : {})}>
        <Animated.View style={[styles.row, contentStyle]}>
          <View style={styles.icon}>
            <GradientFill gradient={holoGradient} />
            {/* En una View: en web, el degradado (absoluto) taparía al SVG del ícono. */}
            <View>
              <Icon icon={icon} size="nav" color={holoGradient.ink} />
            </View>
          </View>
          <View
            accessible
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            accessibilityLabel={announcement}
            style={styles.texts}
          >
            <Text variant="overline" tone="primary">
              {overline}
            </Text>
            <Text variant="titleS" numberOfLines={2}>
              {title}
            </Text>
          </View>
          {xp ? (
            <Animated.View style={xpStyle}>
              <Text variant="numM" style={styles.xp(theme.colors.primary)}>
                {xp}
              </Text>
            </Animated.View>
          ) : null}
          {onDismiss && dismissLabel ? (
            <IconButton
              icon={X}
              variant="plain"
              tone="muted"
              accessibilityLabel={dismissLabel}
              onPress={onDismiss}
            />
          ) : null}
        </Animated.View>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
  },
  // Pulso de glow (M07): una sombra cian detrás de la tarjeta.
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.l,
    boxShadow: theme.elevation.glow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingLeft: theme.space[3],
    paddingRight: theme.space[2],
    paddingVertical: theme.space[3],
  },
  icon: {
    width: componentSize.achievementToastIcon,
    height: componentSize.achievementToastIcon,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: theme.radius.pill,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  xp: (color: string) => ({
    color,
  }),
}));
