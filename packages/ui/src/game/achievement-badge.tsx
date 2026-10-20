import { useEffect, useState } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../lib/color';
import { focusRing } from '../lib/focus-ring';
import { useReduceMotion } from '../motion/accessibility-preferences';
import { springConfig, timingConfig } from '../motion/easing';
import { triggerHaptic } from '../motion/haptics';
import { usePress } from '../motion/use-press';
import { GradientFill } from '../primitives/gradient-fill/gradient-fill';
import { HoloSheen } from '../primitives/holo-sheen/holo-sheen';
import { Icon, type IconComponent } from '../primitives/icon/icon';
import { ProgressRing } from '../primitives/progress/progress';
import { Text } from '../primitives/text/text';
import { componentSize, duration, holoGradient, spring, type ModuleId } from '../tokens';

/** bloqueado (silueta y pista) · en progreso (anillo) · desbloqueado (holo y fecha). */
export type AchievementState = 'locked' | 'progress' | 'unlocked';

/**
 * Familias de logros, cada una con el color de su módulo (§5.2): Control (Gastos), Inversor (Bolsa),
 * Constructor (Patrimonio) y Disciplina (Hábitos y Agenda).
 */
export type AchievementFamily = 'control' | 'investor' | 'builder' | 'discipline';

const FAMILY_MODULE: Record<AchievementFamily, ModuleId> = {
  control: 'expenses',
  investor: 'stocks',
  builder: 'wealth',
  discipline: 'habits',
};

export interface AchievementBadgeProps extends Pick<ViewProps, 'style' | 'testID'> {
  title: string;
  icon: IconComponent;
  state: AchievementState;
  family?: AchievementFamily;
  /** Avance de 0 a 1 en `progress`. */
  progress?: number;
  /** Bajo el título: la pista (bloqueado), el avance ("34 / 100") o la fecha (desbloqueado). */
  detail?: string;
  /** Título, estado y detalle para el lector de pantalla. */
  accessibilityLabel: string;
  /** Abrir el logro en grande (GLB-16). */
  onPress?: () => void;
}

/** Escala del latido al desbloquear. */
const UNLOCK_SCALE = 1.15;

/**
 * X04 · AchievementBadge: medalla con título y detalle en tres estados. Bloqueado: silueta punteada
 * en gris. En progreso: anillo del color de la familia (M05). Desbloqueado: medalla con degradado
 * holo. Si se desbloquea con la medalla a la vista, late, suena la háptica de éxito y la cruza M08.
 */
export function AchievementBadge({
  title,
  icon,
  state,
  family = 'control',
  progress = 0,
  detail,
  accessibilityLabel,
  onPress,
  style,
  testID,
}: AchievementBadgeProps) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const press = usePress();
  // El reflejo solo va si se desbloqueó estando montada: una cuadrícula de logros viejos no brilla.
  const [mountedState] = useState(state);
  const unlockedHere = state === 'unlocked' && mountedState !== 'unlocked';
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!unlockedHere) return;
    triggerHaptic('success');
    if (reduceMotion) return;
    scale.set(
      withSequence(
        withTiming(UNLOCK_SCALE, timingConfig(duration.fast, 'power2Out')),
        withSpring(1, springConfig(spring.reward)),
      ),
    );
  }, [unlockedHere, reduceMotion, scale]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const color = theme.modules[FAMILY_MODULE[family]].color;
  const medalSize = componentSize.achievementMedal;

  const medal =
    state === 'unlocked' ? (
      <View style={styles.medal(medalSize)}>
        <GradientFill gradient={holoGradient} />
        {/* En una View: en web, el degradado (absoluto) taparía al SVG del ícono. */}
        <View>
          <Icon icon={icon} size="empty" color={holoGradient.ink} />
        </View>
        {unlockedHere ? <HoloSheen /> : null}
      </View>
    ) : state === 'progress' ? (
      <ProgressRing
        value={progress}
        color={color}
        size={medalSize}
        strokeWidth={4}
        accessibilityLabel={title}
        {...(detail ? { valueText: detail } : {})}
      >
        <View style={styles.inner(medalSize - 16, withAlpha(color, 0.14))}>
          <Icon icon={icon} size="empty" color={color} />
        </View>
      </ProgressRing>
    ) : (
      <View style={styles.locked(medalSize, theme.colors.inkSubtle)}>
        <Icon icon={icon} size="empty" color={withAlpha(theme.colors.inkSubtle, 0.7)} />
      </View>
    );

  const body = (
    <>
      <Animated.View style={popStyle}>{medal}</Animated.View>
      <Text
        variant="label"
        tone={state === 'locked' ? 'muted' : 'default'}
        numberOfLines={2}
        style={styles.centered}
      >
        {title}
      </Text>
      {detail ? (
        <Text variant="caption" tone="muted" numberOfLines={2} style={styles.centered}>
          {detail}
        </Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.focus, style]}
        testID={testID}
      >
        <Animated.View style={[styles.root, press.animatedStyle]}>{body}</Animated.View>
      </Pressable>
    );
  }
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[styles.root, style]}
      testID={testID}
    >
      {body}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  focus: focusRing(theme.colors.focus),
  root: {
    width: 112,
    alignItems: 'center',
    gap: theme.space[1],
  },
  medal: (size: number) => ({
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: theme.radius.pill,
    boxShadow: theme.elevation.glow,
  }),
  inner: (size: number, background: string) => ({
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: background,
  }),
  locked: (size: number, border: string) => ({
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: border,
  }),
  centered: {
    textAlign: 'center',
  },
}));
