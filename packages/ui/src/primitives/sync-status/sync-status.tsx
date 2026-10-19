import CloudAlert from 'lucide-react-native/icons/cloud-alert';
import CloudCheck from 'lucide-react-native/icons/cloud-check';
import CloudUpload from 'lucide-react-native/icons/cloud-upload';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import WifiOff from 'lucide-react-native/icons/wifi-off';
import { useEffect } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../../lib/color';
import { useReduceMotion } from '../../motion/accessibility-preferences';
import { fadeConfig } from '../../motion/easing';
import { settledOpacity } from '../../motion/motion-math';
import { useAppActive } from '../../motion/use-app-active';
import { usePresence } from '../../motion/use-presence';
import { duration, timing, type SemanticColors } from '../../tokens';
import { Button } from '../button/button';
import { Icon, type IconComponent } from '../icon/icon';
import { Text } from '../text/text';

/** synced: todo arriba · pending: cambios en cola · syncing: subiendo · error: falló el envío. */
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';

const STATUS_ICON: Record<SyncStatus, IconComponent> = {
  synced: CloudCheck,
  pending: CloudUpload,
  syncing: RefreshCw,
  error: CloudAlert,
};

function statusColor(colors: SemanticColors, status: SyncStatus): string {
  return {
    synced: colors.gain,
    pending: colors.warning,
    syncing: colors.primary,
    error: colors.loss,
  }[status];
}

export interface SyncBadgeProps extends Pick<ViewProps, 'style' | 'testID'> {
  status: SyncStatus;
  /** Texto ya traducido, por ejemplo "Pendiente de sincronizar (3)". */
  label: string;
  /** Opcional: al tocarla (por ejemplo, reintentar tras un error). */
  onPress?: () => void;
}

/**
 * P37 · SyncBadge: estado de la sincronización con la nube. Cambia de estado con un fundido y, al
 * sincronizar, el ícono gira (quieto con "reducir movimiento" o la app en segundo plano). En F3 se
 * conecta a la outbox.
 */
export function SyncBadge({ status, label, onPress, style, testID }: SyncBadgeProps) {
  const { theme } = useUnistyles();
  const color = statusColor(theme.colors, status);
  const opacity = useSharedValue(1);

  // Fundido al cambiar de estado.
  useEffect(() => {
    opacity.set(0);
    opacity.set(withTiming(1, fadeConfig(duration.fast)));
  }, [status, opacity]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const body = (
    <Animated.View
      style={[styles.badge(withAlpha(color, 0.45), withAlpha(color, 0.12)), fadeStyle]}
    >
      <SyncIcon icon={STATUS_ICON[status]} color={color} spinning={status === 'syncing'} />
      <Text variant="caption" style={styles.label(color)}>
        {label}
      </Text>
    </Animated.View>
  );

  if (!onPress) {
    return (
      <View
        accessible
        accessibilityLabel={label}
        accessibilityLiveRegion="polite"
        style={style}
        testID={testID}
      >
        {body}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      onPress={onPress}
      hitSlop={theme.space[2]}
      style={style}
      testID={testID}
    >
      {body}
    </Pressable>
  );
}

function SyncIcon({
  icon,
  color,
  spinning,
}: {
  icon: IconComponent;
  color: string;
  spinning: boolean;
}) {
  const reduceMotion = useReduceMotion();
  const appActive = useAppActive();
  const turn = useSharedValue(0);
  const animate = spinning && !reduceMotion && appActive;

  useEffect(() => {
    if (!animate) {
      cancelAnimation(turn);
      turn.set(0);
      return undefined;
    }
    turn.set(0);
    turn.set(
      withRepeat(
        withTiming(360, {
          duration: timing.syncSpin,
          easing: Easing.linear,
          reduceMotion: ReduceMotion.Never,
        }),
        -1,
      ),
    );
    return () => {
      cancelAnimation(turn);
    };
  }, [animate, turn]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get()}deg` }] }));
  return (
    <Animated.View style={spinStyle}>
      <Icon icon={icon} size="inline" color={color} />
    </Animated.View>
  );
}

export interface OfflineBannerProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Se muestra mientras no hay conexión; aparece y desaparece con un fundido. */
  visible: boolean;
  /** Texto ya traducido ("Sin conexión. Tus cambios se guardan y se enviarán después."). */
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** P37 · OfflineBanner: aviso de "Sin conexión" arriba del contenido, con fundido. */
export function OfflineBanner({
  visible,
  message,
  actionLabel,
  onAction,
  style,
  testID,
}: OfflineBannerProps) {
  const { theme } = useUnistyles();
  const { mounted, progress } = usePresence(visible, { enter: 'fade' });
  const fadeStyle = useAnimatedStyle(() => ({ opacity: settledOpacity(progress.get()) }));
  if (!mounted) return null;

  const color = theme.colors.warning;
  return (
    <Animated.View
      style={[styles.banner(withAlpha(color, 0.45), withAlpha(color, 0.14)), fadeStyle, style]}
      testID={testID}
    >
      <Icon icon={WifiOff} size="list" color={color} />
      <Text
        variant="label"
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={styles.message}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="ghost" size="s" />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  badge: (border: string, fill: string) => ({
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: fill,
  }),
  label: (color: string) => ({
    color,
    fontFamily: theme.font.body600,
  }),
  banner: (border: string, fill: string) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: fill,
  }),
  message: {
    flex: 1,
  },
}));
