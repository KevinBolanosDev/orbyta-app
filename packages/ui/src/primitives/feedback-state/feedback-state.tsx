import TriangleAlert from 'lucide-react-native/icons/triangle-alert';
import { View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useEnter } from '../../motion/use-enter';
import { Button } from '../button/button';
import { Icon, type IconComponent } from '../icon/icon';
import { Text } from '../text/text';

export interface EmptyStateProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Ícono de 32 px que ilustra lo que falta. */
  icon?: IconComponent;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** P21 · EmptyState: ícono + título + texto + acción, centrado, con entrada M01. */
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
  testID,
}: EmptyStateProps) {
  const enter = useEnter();
  return (
    <Animated.View style={[styles.block, enter, style]} testID={testID}>
      {icon ? <Icon icon={icon} size="empty" tone="muted" /> : null}
      <Text variant="titleS" accessibilityRole="header" style={styles.center}>
        {title}
      </Text>
      {message ? (
        <Text tone="muted" style={styles.center}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      ) : null}
    </Animated.View>
  );
}

export interface ErrorStateProps extends Pick<ViewProps, 'style' | 'testID'> {
  title: string;
  message?: string;
  /** Texto del botón para volver a intentar ("Reintentar"). */
  retryLabel?: string;
  onRetry?: () => void;
  /** Variante compacta en una fila, dentro de una tarjeta o formulario. */
  inline?: boolean;
}

/**
 * P22 · ErrorState: como EmptyState pero con el ícono de alerta en `loss` y "Reintentar". El título
 * se anuncia al lector de pantalla al aparecer (rol `alert`).
 */
export function ErrorState({
  title,
  message,
  retryLabel,
  onRetry,
  inline = false,
  style,
  testID,
}: ErrorStateProps) {
  const enter = useEnter();
  const retry =
    retryLabel && onRetry ? (
      <Button
        label={retryLabel}
        onPress={onRetry}
        variant={inline ? 'ghost' : 'secondary'}
        size={inline ? 's' : 'm'}
        style={inline ? undefined : styles.action}
      />
    ) : null;

  if (inline) {
    return (
      <Animated.View style={[styles.row, enter, style]} testID={testID}>
        <Icon icon={TriangleAlert} size="list" tone="loss" />
        <View style={styles.texts}>
          <Text variant="label" accessibilityRole="alert" accessibilityLiveRegion="polite">
            {title}
          </Text>
          {message ? (
            <Text variant="caption" tone="muted">
              {message}
            </Text>
          ) : null}
        </View>
        {retry}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.block, enter, style]} testID={testID}>
      <Icon icon={TriangleAlert} size="empty" tone="loss" />
      <Text
        variant="titleS"
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={styles.center}
      >
        {title}
      </Text>
      {message ? (
        <Text tone="muted" style={styles.center}>
          {message}
        </Text>
      ) : null}
      {retry}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  block: {
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[8],
    paddingHorizontal: theme.space[6],
  },
  center: {
    textAlign: 'center',
  },
  action: {
    alignSelf: 'center',
    marginTop: theme.space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
}));
