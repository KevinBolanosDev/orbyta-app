import CircleAlert from 'lucide-react-native/icons/circle-alert';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import Info from 'lucide-react-native/icons/info';
import RotateCcw from 'lucide-react-native/icons/rotate-ccw';
import X from 'lucide-react-native/icons/x';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AchievementToast } from '../../game/achievement-toast';
import { useReduceMotion } from '../../motion/accessibility-preferences';
import { settledOpacity } from '../../motion/motion-math';
import { usePresence } from '../../motion/use-presence';
import {
  componentSize,
  distance,
  duration,
  radius,
  timing,
  type SemanticColors,
} from '../../tokens';
import { Button } from '../button/button';
import { GlassSurface } from '../glass-surface/glass-surface';
import { Icon, type IconComponent } from '../icon/icon';
import { IconButton } from '../icon-button/icon-button';
import { Text } from '../text/text';

import {
  dismissToast,
  enqueueToast,
  MAX_VISIBLE_TOASTS,
  removeToast,
  type ToastEntry,
  type ToastOptions,
  type ToastTone,
} from './toast-queue';

export interface ToastApi {
  /** Muestra un toast y devuelve su id. */
  show: (options: ToastOptions) => number;
  /** Lo cierra antes de tiempo. */
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Muestra toasts desde cualquier pantalla dentro de `ToastProvider`. */
export function useToast(): ToastApi {
  const api = use(ToastContext);
  if (!api) throw new Error('useToast must be used inside a ToastProvider');
  return api;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Nombre accesible del × de cada toast ("Descartar"). */
  dismissLabel: string;
  maxVisible?: number;
}

/**
 * P23 · ToastProvider: cola de toasts sobre la pantalla (`z.toast`). Arriba en móvil (`compact`) y
 * abajo a la derecha desde `medium` (web y tablet). Cada toast entra con M01, se va solo a los 4 s
 * (6 s si tiene acción) y sale en 200 ms. Va en la raíz de la app (F2); el catálogo monta el suyo.
 */
export function ToastProvider({
  children,
  dismissLabel,
  maxVisible = MAX_VISIBLE_TOASTS,
}: ToastProviderProps) {
  const [queue, setQueue] = useState<ToastEntry[]>([]);
  const nextIdRef = useRef(1);

  const show = useCallback(
    (options: ToastOptions) => {
      const id = nextIdRef.current;
      nextIdRef.current += 1;
      const entry: ToastEntry = {
        ...options,
        id,
        tone: options.tone ?? 'info',
        duration: options.duration ?? defaultDuration(options),
        leaving: false,
      };
      setQueue((current) => enqueueToast(current, entry, maxVisible));
      return id;
    },
    [maxVisible],
  );
  const dismiss = useCallback((id: number) => {
    setQueue((current) => dismissToast(current, id));
  }, []);
  const remove = useCallback((id: number) => {
    setQueue((current) => removeToast(current, id));
  }, []);
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext value={api}>
      <View style={styles.host}>
        {children}
        <ToastViewport
          queue={queue}
          dismissLabel={dismissLabel}
          onDismiss={dismiss}
          onRemoved={remove}
        />
      </View>
    </ToastContext>
  );
}

function defaultDuration(options: ToastOptions): number {
  if (options.achievement) return timing.achievementToast;
  return options.onAction ? timing.toastWithAction : timing.toast;
}

type Placement = 'top' | 'bottom';

function ToastViewport({
  queue,
  dismissLabel,
  onDismiss,
  onRemoved,
}: {
  queue: readonly ToastEntry[];
  dismissLabel: string;
  onDismiss: (id: number) => void;
  onRemoved: (id: number) => void;
}) {
  const { rt } = useUnistyles();
  const placement: Placement = (rt.breakpoint ?? 'compact') === 'compact' ? 'top' : 'bottom';
  // Arriba, el más nuevo queda primero (junto al borde); abajo, último.
  const ordered = placement === 'top' ? [...queue].reverse() : queue;
  return (
    <View pointerEvents="box-none" style={styles.viewport(placement)}>
      {ordered.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          placement={placement}
          dismissLabel={dismissLabel}
          onDismiss={onDismiss}
          onRemoved={onRemoved}
        />
      ))}
    </View>
  );
}

const TONE_ICON: Record<ToastTone, IconComponent> = {
  info: Info,
  success: CircleCheck,
  error: CircleAlert,
  undo: RotateCcw,
};

function toneColor(colors: SemanticColors, tone: ToastTone): string {
  return { info: colors.info, success: colors.gain, error: colors.loss, undo: colors.primary }[
    tone
  ];
}

function ToastItem({
  toast,
  placement,
  dismissLabel,
  onDismiss,
  onRemoved,
}: {
  toast: ToastEntry;
  placement: Placement;
  dismissLabel: string;
  onDismiss: (id: number) => void;
  onRemoved: (id: number) => void;
}) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const { id, leaving, duration: visibleFor } = toast;
  const { mounted, progress } = usePresence(!leaving, {
    exitMs: duration.fast,
    onExited: () => {
      onRemoved(id);
    },
  });

  // Se va solo pasado su tiempo.
  useEffect(() => {
    if (leaving) return undefined;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, visibleFor);
    return () => {
      clearTimeout(timer);
    };
  }, [id, leaving, visibleFor, onDismiss]);

  // M01 desde el borde donde aparece: baja si está arriba, sube si está abajo. El logro trae su
  // propia entrada (M07).
  const offset =
    reduceMotion || toast.achievement
      ? 0
      : placement === 'top'
        ? -distance.enterOffset
        : distance.enterOffset;
  // El fundido va al relleno del vidrio (`fade`) y al contenido, no al contenedor (ver GlassSurface).
  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.get()) * offset }],
  }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: settledOpacity(progress.get()) }));
  if (!mounted) return null;

  if (toast.achievement) {
    return (
      <Animated.View style={[styles.item, slideStyle]}>
        <AchievementToast
          overline={toast.achievement.overline}
          title={toast.message}
          {...(toast.achievement.xp ? { xp: toast.achievement.xp } : {})}
          {...(toast.achievement.icon ? { icon: toast.achievement.icon } : {})}
          fade={progress}
          dismissLabel={dismissLabel}
          onDismiss={() => {
            onDismiss(id);
          }}
        />
      </Animated.View>
    );
  }

  const color = toneColor(theme.colors, toast.tone);
  return (
    <Animated.View style={[styles.item, slideStyle]}>
      <GlassSurface level="sheet" cornerRadius={radius.l} fade={progress} style={styles.toast}>
        <Animated.View style={[styles.row, fadeStyle]}>
          <Icon icon={TONE_ICON[toast.tone]} size="list" color={color} />
          <Text
            variant="label"
            accessibilityRole="alert"
            accessibilityLiveRegion={toast.tone === 'error' ? 'assertive' : 'polite'}
            style={styles.message}
          >
            {toast.message}
          </Text>
          {toast.actionLabel && toast.onAction ? (
            <Button
              label={toast.actionLabel}
              variant="ghost"
              size="s"
              onPress={() => {
                toast.onAction?.();
                onDismiss(id);
              }}
            />
          ) : null}
          <IconButton
            icon={X}
            variant="plain"
            tone="muted"
            accessibilityLabel={dismissLabel}
            onPress={() => {
              onDismiss(id);
            }}
          />
        </Animated.View>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  host: {
    flex: 1,
  },
  viewport: (placement: Placement) => ({
    position: 'absolute',
    zIndex: theme.z.toast,
    gap: theme.space[2],
    ...(placement === 'top'
      ? {
          top: rt.insets.top + theme.space[3],
          left: theme.layout.screenGutter,
          right: theme.layout.screenGutter,
        }
      : {
          bottom: rt.insets.bottom + theme.space[6],
          right: theme.space[6],
          width: componentSize.toastMaxWidth,
          maxWidth: rt.screen.width - theme.space[6] * 2,
        }),
  }),
  item: {
    width: '100%',
  },
  toast: {
    boxShadow: theme.elevation.e1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingLeft: theme.space[4],
    paddingRight: theme.space[1],
    paddingVertical: theme.space[1],
    minHeight: theme.layout.minTouchTarget + theme.space[2],
  },
  message: {
    flex: 1,
    paddingVertical: theme.space[2],
  },
}));
