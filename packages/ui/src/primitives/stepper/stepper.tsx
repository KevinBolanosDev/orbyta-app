import Check from 'lucide-react-native/icons/check';
import { Fragment } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../../lib/color';
import { useProgressFill } from '../../motion/use-progress-fill';
import { componentSize } from '../../tokens';
import { Icon } from '../icon/icon';
import { stepState, type StepState } from '../progress/progress-math';
import { Text } from '../text/text';

export interface StepperProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Nombre de cada paso, en orden (llegan traducidos). */
  steps: readonly string[];
  /** Paso actual, desde 0. */
  current: number;
  /** Lo que lee el lector de pantalla, por ejemplo "Paso 2 de 3". */
  accessibilityLabel: string;
}

/**
 * P34 · Stepper: indicador de pasos de un asistente. Los pasos hechos llevan ✓, el actual va
 * resaltado y los conectores se llenan con M05 al avanzar. Debajo, el nombre del paso actual.
 */
export function Stepper({ steps, current, accessibilityLabel, style, testID }: StepperProps) {
  const total = steps.length;
  const index = Math.min(Math.max(current, 0), Math.max(total - 1, 0));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 1, max: total, now: index + 1, text: steps[index] }}
      style={[styles.root, style]}
      testID={testID}
    >
      <View style={styles.row}>
        {steps.map((step, i) => (
          <Fragment key={step}>
            {i > 0 ? <Connector filled={i <= index} /> : null}
            <StepDot number={i + 1} state={stepState(i, index)} />
          </Fragment>
        ))}
      </View>
      <Text variant="titleS">{steps[index]}</Text>
    </View>
  );
}

function StepDot({ number, state }: { number: number; state: StepState }) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.dot(state)}>
      {state === 'done' ? (
        <Icon icon={Check} size="inline" color={theme.colors.onPrimary} />
      ) : (
        <Text variant="label" tone={state === 'current' ? 'primary' : 'muted'}>
          {number}
        </Text>
      )}
    </View>
  );
}

function Connector({ filled }: { filled: boolean }) {
  const { theme } = useUnistyles();
  const progress = useProgressFill(filled ? 1 : 0);
  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));
  return (
    <View style={styles.connector(withAlpha(theme.colors.inkSubtle, 0.3))}>
      <Animated.View style={[styles.connectorFill, fillStyle]} />
    </View>
  );
}

const DOT = componentSize.stepDot;

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.space[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: (state: StepState) => ({
    width: DOT,
    height: DOT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: state === 'done' ? 0 : 2,
    borderColor: state === 'current' ? theme.colors.primary : theme.glass.card.border,
    backgroundColor: state === 'done' ? theme.colors.primary : theme.glass.card.fill,
    boxShadow: state === 'current' ? theme.elevation.glow : undefined,
  }),
  connector: (track: string) => ({
    flex: 1,
    height: 2,
    marginHorizontal: theme.space[2],
    overflow: 'hidden',
    borderRadius: theme.radius.pill,
    backgroundColor: track,
  }),
  connectorFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
}));
