import { useState, type ReactNode } from 'react';
import { Pressable, View, type AccessibilityActionEvent, type ViewProps } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import { swipeOffset, swipeRelease, SWIPE_THRESHOLD } from '../../lib/swipe';
import { useReduceMotion } from '../../motion/accessibility-preferences';
import { springConfig, timingConfig } from '../../motion/easing';
import { triggerHaptic } from '../../motion/haptics';
import { duration, spring, type SemanticColors } from '../../tokens';
import { Icon, type IconComponent } from '../icon/icon';
import { Text } from '../text/text';

export interface SwipeAction {
  /** Nombre de la acción; también se ofrece al lector de pantalla como acción de la fila. */
  label: string;
  icon: IconComponent;
  /** primary (editar, completar) · danger (eliminar) · neutral (posponer, archivar). */
  tone?: 'primary' | 'danger' | 'neutral';
  onAction: () => void;
  /** La acción quita la fila: sale hacia el lado del gesto y se cierra (M11) antes de `onAction`. */
  removes?: boolean;
}

export interface ListItemProps extends Pick<ViewProps, 'style' | 'testID'> {
  title: string;
  subtitle?: string;
  /** Ícono o Avatar a la izquierda. */
  leading?: ReactNode;
  /** Valor a la derecha (por ejemplo, un AmountText) o un texto. */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Acción al deslizar hacia la derecha (aparece a la izquierda). */
  leadingAction?: SwipeAction;
  /** Acción al deslizar hacia la izquierda (aparece a la derecha), por ejemplo "Eliminar". */
  trailingAction?: SwipeAction;
  /** Al insertarse en una lista, aparece con fundido (M11). */
  animateIn?: boolean;
}

function actionColor(colors: SemanticColors, tone: SwipeAction['tone']): string {
  return { primary: colors.primary, danger: colors.loss, neutral: colors.inkMuted }[
    tone ?? 'primary'
  ];
}

/**
 * P26 · ListItem: ícono o avatar, título, subtítulo y valor a la derecha. Con acciones, la fila sigue
 * al dedo (M12): pasado el umbral el ícono crece, hay háptica media y al soltar se ejecuta; si la
 * acción quita la fila, sale hacia el lado del gesto y se cierra en alto (M11). Las mismas acciones
 * están para el lector de pantalla como acciones de la fila.
 */
export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  leadingAction,
  trailingAction,
  animateIn = false,
  style,
  testID,
}: ListItemProps) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const offset = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const collapse = useSharedValue(0);
  const armed = useSharedValue(false);
  const [removing, setRemoving] = useState(false);
  const hasLeading = leadingAction !== undefined;
  const hasTrailing = trailingAction !== undefined;
  const settle = springConfig(spring.press);

  // Ejecuta una acción; si quita la fila, primero sale hacia su lado y se cierra.
  const run = (side: 'leading' | 'trailing') => {
    const action = side === 'leading' ? leadingAction : trailingAction;
    if (!action) return;
    if (!action.removes) {
      offset.set(withSpring(0, settle));
      action.onAction();
      return;
    }
    setRemoving(true);
    const exit = reduceMotion ? 0 : duration.base;
    const direction = side === 'leading' ? 1 : -1;
    offset.set(withTiming(direction * width.get(), timingConfig(exit, 'power2In')));
    collapse.set(withTiming(1, timingConfig(exit, 'power2In')));
    setTimeout(action.onAction, exit);
  };

  const pan = usePanGesture({
    enabled: (hasLeading || hasTrailing) && !removing,
    // Horizontal: un arrastre vertical deja pasar el desplazamiento de la lista.
    activeOffsetX: [-12, 12],
    failOffsetY: [-10, 10],
    onUpdate: (event) => {
      'worklet';
      const next = swipeOffset(event.translationX, hasLeading, hasTrailing);
      offset.set(next);
      const past = Math.abs(next) >= SWIPE_THRESHOLD;
      if (past !== armed.get()) {
        armed.set(past);
        if (past) scheduleOnRN(triggerHaptic, 'medium');
      }
    },
    onDeactivate: (event) => {
      'worklet';
      armed.set(false);
      const side = swipeRelease(offset.get(), event.velocityX);
      if (side === 'none') {
        offset.set(withSpring(0, settle));
        return;
      }
      scheduleOnRN(run, side);
    },
  });

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));
  const outerStyle = useAnimatedStyle(() =>
    collapse.get() > 0
      ? { height: height.get() * (1 - collapse.get()), opacity: 1 - collapse.get() }
      : {},
  );
  // Solo se ve el fondo del lado hacia el que se desliza; el ícono crece al pasar el umbral.
  const leadingSideStyle = useAnimatedStyle(() => ({ opacity: offset.get() > 0 ? 1 : 0 }));
  const trailingSideStyle = useAnimatedStyle(() => ({ opacity: offset.get() < 0 ? 1 : 0 }));
  const leadingIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: offset.get() >= SWIPE_THRESHOLD ? 1.25 : 1 }],
  }));
  const trailingIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: offset.get() <= -SWIPE_THRESHOLD ? 1.25 : 1 }],
  }));

  const actions = [leadingAction, trailingAction].filter((a): a is SwipeAction => a !== undefined);
  // Nombre de la fila y sus acciones de deslizar, ofrecidas también al lector de pantalla.
  const a11y = {
    accessibilityLabel: subtitle ? `${title}, ${subtitle}` : title,
    accessibilityActions: actions.map((action) => ({ name: action.label, label: action.label })),
    onAccessibilityAction: (event: AccessibilityActionEvent) => {
      const name = event.nativeEvent.actionName;
      if (name === leadingAction?.label) run('leading');
      else if (name === trailingAction?.label) run('trailing');
    },
  };

  const content = (
    <View style={styles.content}>
      {leading}
      <View style={styles.texts}>
        <Text numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {typeof trailing === 'string' ? <Text variant="numM">{trailing}</Text> : trailing}
    </View>
  );

  return (
    <Animated.View
      entering={animateIn && !reduceMotion ? FadeIn.duration(duration.base) : undefined}
      style={[styles.outer, outerStyle, style]}
      onLayout={(event) => {
        if (collapse.get() === 0) {
          height.set(event.nativeEvent.layout.height);
          width.set(event.nativeEvent.layout.width);
        }
      }}
      testID={testID}
    >
      {leadingAction ? (
        <Animated.View
          style={[
            styles.actionSide('leading', actionColor(theme.colors, leadingAction.tone)),
            leadingSideStyle,
          ]}
        >
          <Animated.View style={leadingIconStyle}>
            <Icon icon={leadingAction.icon} size="nav" color={theme.colors.onPrimary} />
          </Animated.View>
        </Animated.View>
      ) : null}
      {trailingAction ? (
        <Animated.View
          style={[
            styles.actionSide('trailing', actionColor(theme.colors, trailingAction.tone)),
            trailingSideStyle,
          ]}
        >
          <Animated.View style={trailingIconStyle}>
            <Icon icon={trailingAction.icon} size="nav" color={theme.colors.onPrimary} />
          </Animated.View>
        </Animated.View>
      ) : null}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.row, rowStyle]}>
          {onPress ? (
            <Pressable
              accessibilityRole="button"
              {...a11y}
              onPress={onPress}
              style={({ pressed }) => styles.pressable(pressed)}
            >
              {content}
            </Pressable>
          ) : (
            // Sin `onPress` es una View accesible y no un Pressable deshabilitado: lo deshabilitado no
            // recibe las acciones de la fila.
            <View accessible {...a11y} style={styles.pressable(false)}>
              {content}
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  outer: {
    overflow: 'hidden',
    borderRadius: theme.radius.m,
  },
  actionSide: (side: 'leading' | 'trailing', color: string) => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: side === 'leading' ? 'flex-start' : 'flex-end',
    paddingHorizontal: theme.space[6],
    backgroundColor: color,
  }),
  // Fondo opaco: tapa el color de la acción mientras la fila está en su lugar.
  row: {
    backgroundColor: theme.colors.bg,
  },
  pressable: (pressed: boolean) => ({
    backgroundColor: theme.glass.card.fill,
    opacity: pressed ? 0.8 : 1,
  }),
  content: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
  },
  texts: {
    flex: 1,
    gap: 2,
  },
}));
