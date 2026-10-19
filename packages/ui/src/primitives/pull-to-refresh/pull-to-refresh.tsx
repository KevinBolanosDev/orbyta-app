import { useEffect, useId, type ReactNode } from 'react';
import { Platform, View, type ScrollViewProps } from 'react-native';
import { GestureDetector, ScrollView, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import { PULL_REFRESHING_OFFSET, PULL_THRESHOLD, pullOffset, pullProgress } from '../../lib/swipe';
import { useReduceMotion } from '../../motion/accessibility-preferences';
import { springConfig } from '../../motion/easing';
import { triggerHaptic } from '../../motion/haptics';
import { spring } from '../../tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING = { size: 32, stroke: 3 };
const RADIUS = (RING.size - RING.stroke) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Una vuelta del anillo mientras actualiza. */
const SPIN_MS = 900;
const SETTLE = springConfig(spring.sheet);

export interface PullToRefreshProps extends Pick<
  ScrollViewProps,
  'contentContainerStyle' | 'style' | 'testID'
> {
  refreshing: boolean;
  onRefresh: () => void;
  /** Nombre de la acción para el lector de pantalla ("Actualizar"). */
  refreshLabel: string;
  children: ReactNode;
}

/**
 * P38 · PullToRefresh: lista con desplazamiento que se actualiza al tirar hacia abajo desde arriba
 * (M16). Un anillo aurora se llena con el tirón, gira mientras `refreshing` y hay háptica ligera al
 * soltar. El lector de pantalla tiene la acción "Actualizar". En web no hay tirón (el navegador ya
 * tiene el suyo): solo se ve el anillo mientras actualiza.
 */
export function PullToRefresh({
  refreshing,
  onRefresh,
  refreshLabel,
  contentContainerStyle,
  style,
  testID,
  children,
}: PullToRefreshProps) {
  const reduceMotion = useReduceMotion();
  const pull = useSharedValue(0);
  const atTop = useSharedValue(true);
  const busy = useSharedValue(refreshing);
  const turn = useSharedValue(0);

  // `refreshing` manda: al empezar deja la lista bajada con el anillo; al terminar la sube.
  useEffect(() => {
    busy.set(refreshing);
    pull.set(withSpring(refreshing ? PULL_REFRESHING_OFFSET : 0, SETTLE));
    if (refreshing && !reduceMotion) {
      turn.set(0);
      turn.set(
        withRepeat(
          withTiming(360, {
            duration: SPIN_MS,
            easing: Easing.linear,
            reduceMotion: ReduceMotion.Never,
          }),
          -1,
        ),
      );
    } else {
      cancelAnimation(turn);
      turn.set(0);
    }
  }, [refreshing, reduceMotion, pull, busy, turn]);

  const pan = usePanGesture({
    enabled: Platform.OS !== 'web',
    activeOffsetY: 10,
    failOffsetX: [-16, 16],
    onUpdate: (event) => {
      'worklet';
      if (!atTop.get() || busy.get()) return;
      pull.set(pullOffset(event.translationY));
    },
    onDeactivate: () => {
      'worklet';
      if (busy.get()) return;
      if (pull.get() >= PULL_THRESHOLD) {
        busy.set(true);
        pull.set(withSpring(PULL_REFRESHING_OFFSET, SETTLE));
        scheduleOnRN(triggerHaptic, 'light');
        scheduleOnRN(onRefresh);
        return;
      }
      pull.set(withSpring(0, SETTLE));
    },
  });

  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pull.get() }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: Math.min(pull.get() / (PULL_THRESHOLD * 0.5), 1),
    transform: [{ translateY: pull.get() * 0.5 - RING.size }, { rotate: `${turn.get()}deg` }],
  }));

  return (
    <View
      style={[styles.root, style]}
      accessibilityActions={[{ name: 'refresh', label: refreshLabel }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'refresh' && !refreshing) onRefresh();
      }}
      testID={testID}
    >
      <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]}>
        <AuroraRing pull={pull} busy={refreshing} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.root, contentStyle]}>
          <ScrollView
            simultaneousWith={pan}
            bounces={false}
            scrollEventThrottle={16}
            onScroll={(event) => {
              atTop.set(event.nativeEvent.contentOffset.y <= 0);
            }}
            contentContainerStyle={contentContainerStyle}
            accessibilityState={{ busy: refreshing }}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/** Anillo con el degradado de la aurora (primary → accent): se llena con el tirón. */
function AuroraRing({ pull, busy }: { pull: SharedValue<number>; busy: boolean }) {
  const { theme } = useUnistyles();
  const id = `pull-${useId().replace(/[^\w-]/g, '')}`;
  const arcProps = useAnimatedProps(() => {
    // Mientras actualiza, un arco de tres cuartos que gira; si no, lo que va del tirón.
    const fill = busy ? 0.75 : pullProgress(pull.get());
    return { strokeDashoffset: CIRCUMFERENCE * (1 - fill) };
  });
  return (
    <Svg width={RING.size} height={RING.size}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset={0} stopColor={theme.colors.primary} />
          <Stop offset={1} stopColor={theme.colors.accent} />
        </LinearGradient>
      </Defs>
      <AnimatedCircle
        cx={RING.size / 2}
        cy={RING.size / 2}
        r={RADIUS}
        stroke={`url(#${id})`}
        strokeWidth={RING.stroke}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        fill="none"
        animatedProps={arcProps}
      />
    </Svg>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
  },
  ring: {
    position: 'absolute',
    top: theme.space[3],
    alignSelf: 'center',
    zIndex: theme.z.sticky,
  },
}));
