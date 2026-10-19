import type { ReactNode } from 'react';
import { Modal, Pressable, View, type ViewProps } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { fillParent } from '../../lib/fill-parent';
import { useReduceMotion } from '../../motion/accessibility-preferences';
import { settledOpacity } from '../../motion/motion-math';
import { usePresence } from '../../motion/use-presence';
import { componentSize, radius } from '../../tokens';
import { GlassSurface } from '../glass-surface/glass-surface';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Escala desde la que entra el diálogo centrado. */
const DIALOG_FROM_SCALE = 0.94;

interface OverlayProps {
  visible: boolean;
  /** Tocar el fondo, la tecla Escape (web) o el botón Atrás (Android). */
  onRequestClose: () => void;
  /** bottom: hoja inferior · center: diálogo. */
  placement: 'bottom' | 'center';
  /** Recibe el progreso de la entrada (0–1, con el resorte M10) para animar el panel. */
  children: (progress: SharedValue<number>) => ReactNode;
}

/**
 * Capa de superposición de BottomSheet (P24) y Dialog (P25): un `Modal` transparente con el scrim que
 * aparece con fundido y el panel que entra con el resorte M10. Al cerrarse, sale (`power2.in`) y
 * recién después se desmonta. No es pública: la usan solo esas dos primitivas.
 *
 * El `Modal` es otra raíz en Android: lleva su propio `GestureHandlerRootView` para el arrastre.
 */
export function Overlay({ visible, onRequestClose, placement, children }: OverlayProps) {
  const { mounted, progress } = usePresence(visible, { enter: 'spring' });
  const scrimStyle = useAnimatedStyle(() => ({ opacity: Math.min(progress.get(), 1) }));
  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={onRequestClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      {/* En web este View de terceros no aplica los estilos de Unistyles y queda con el alto de su
          contenido: por eso el scrim y las capas se fijan a la ventana (`_web`). */}
      <GestureHandlerRootView>
        {/* Decorativo para el lector de pantalla: el panel tiene su botón de cerrar o cancelar. */}
        <AnimatedPressable
          accessible={false}
          importantForAccessibility="no"
          onPress={onRequestClose}
          style={[styles.scrim, scrimStyle]}
        />
        <View
          pointerEvents="box-none"
          style={placement === 'bottom' ? styles.bottomLayer : styles.centerLayer}
        >
          {children(progress)}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

interface CenteredPanelProps extends Pick<ViewProps, 'testID' | 'role'> {
  progress: SharedValue<number>;
  /** Nombre del diálogo para el lector de pantalla (su título). */
  accessibilityLabel?: string;
  children: ReactNode;
}

/**
 * Panel del diálogo centrado (M10, versión centrada): vidrio `sheet` con las cuatro esquinas
 * redondeadas, que entra con fundido y escala 0,94 → 1. Con "reducir movimiento", solo fundido.
 * El fundido va al relleno del vidrio (`fade`) y al contenido por separado, nunca al contenedor
 * (ver GlassSurface).
 */
export function CenteredPanel({
  progress,
  accessibilityLabel,
  role = 'dialog',
  children,
  testID,
}: CenteredPanelProps) {
  const reduceMotion = useReduceMotion();
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: reduceMotion ? 1 : DIALOG_FROM_SCALE + (1 - DIALOG_FROM_SCALE) * progress.get() },
    ],
  }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: settledOpacity(progress.get()) }));
  return (
    <Animated.View style={[styles.centered, scaleStyle]}>
      <GlassSurface
        level="sheet"
        cornerRadius={radius.xl}
        fade={progress}
        role={role}
        aria-modal
        accessibilityViewIsModal
        accessibilityLabel={accessibilityLabel}
        style={styles.panel}
        testID={testID}
      >
        <Animated.View style={[styles.panelBody, fadeStyle]}>{children}</Animated.View>
      </GlassSurface>
    </Animated.View>
  );
}

// Ocupa toda la pantalla: en nativo dentro de GestureHandlerRootView, en web fijo a la ventana.
const fullScreen = { ...fillParent, _web: { position: 'fixed' } } as const;

const styles = StyleSheet.create((theme, rt) => ({
  scrim: {
    ...fullScreen,
    backgroundColor: theme.colors.scrim,
  },
  bottomLayer: {
    ...fullScreen,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  centerLayer: {
    ...fullScreen,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.layout.screenGutter,
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
  },
  centered: {
    width: '100%',
    maxWidth: componentSize.dialogMaxWidth,
    maxHeight: rt.screen.height - rt.insets.top - rt.insets.bottom - theme.space[12],
  },
  panel: {
    flexShrink: 1,
    boxShadow: theme.elevation.e3,
  },
  panelBody: {
    flexShrink: 1,
    gap: theme.space[4],
    padding: theme.layout.cardPadding,
  },
}));
