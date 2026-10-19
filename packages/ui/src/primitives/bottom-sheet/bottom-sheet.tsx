import X from 'lucide-react-native/icons/x';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import { useReduceMotion } from '../../motion/accessibility-preferences';
import { springConfig } from '../../motion/easing';
import { triggerHaptic } from '../../motion/haptics';
import { settledOpacity } from '../../motion/motion-math';
import { componentSize, spring } from '../../tokens';
import { GlassSurface } from '../glass-surface/glass-surface';
import { IconButton } from '../icon-button/icon-button';
import { CenteredPanel, Overlay } from '../overlay/overlay';
import { Text } from '../text/text';

import {
  sheetDragOffset,
  sheetFixedHeight,
  sheetMaxHeight,
  shouldDismissSheet,
  type SheetHeight,
} from './sheet-math';

export interface BottomSheetProps {
  visible: boolean;
  /** Cierra la hoja: botón ×, fondo, arrastre hacia abajo, Escape (web) o Atrás (Android). */
  onClose: () => void;
  /** Nombre accesible del botón × ("Cerrar"). */
  closeLabel: string;
  title?: string;
  /** auto: según el contenido · half: media pantalla · full: casi completa. */
  height?: SheetHeight;
  /** Acciones fijas abajo (por ejemplo, "Guardar"), fuera del desplazamiento. */
  footer?: ReactNode;
  children?: ReactNode;
  testID?: string;
}

/**
 * P24 · BottomSheet: hoja de vidrio (`glass.sheet`) que sube con el resorte M10 sobre un scrim con
 * fundido. Se cierra arrastrando el asa hacia abajo (háptica ligera al volver a encajar); en
 * `expanded` se vuelve un diálogo centrado (§6.3). Con "reducir movimiento" aparece con fundido.
 * Propia sobre gesture-handler y Reanimated (ADR 0016).
 */
export function BottomSheet({
  visible,
  onClose,
  closeLabel,
  title,
  height = 'auto',
  footer,
  children,
  testID,
}: BottomSheetProps) {
  const { rt } = useUnistyles();
  const asDialog = rt.breakpoint === 'expanded';
  const header = <SheetHeader title={title} closeLabel={closeLabel} onClose={onClose} />;
  const body = (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        asDialog ? undefined : styles.sheetContent(footer === undefined),
      ]}
    >
      {children}
    </ScrollView>
  );
  const actions =
    footer === undefined ? null : (
      <View style={[styles.footer, asDialog ? undefined : styles.sheetFooter]}>{footer}</View>
    );

  return (
    <Overlay visible={visible} onRequestClose={onClose} placement={asDialog ? 'center' : 'bottom'}>
      {(progress) =>
        asDialog ? (
          <CenteredPanel progress={progress} accessibilityLabel={title} testID={testID}>
            {header}
            {body}
            {actions}
          </CenteredPanel>
        ) : (
          <SheetPanel
            progress={progress}
            height={height}
            title={title}
            onClose={onClose}
            header={header}
            testID={testID}
          >
            {body}
            {actions}
          </SheetPanel>
        )
      }
    </Overlay>
  );
}

function SheetHeader({
  title,
  closeLabel,
  onClose,
}: {
  title: string | undefined;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.title}>
        {title ? (
          <Text variant="titleM" accessibilityRole="header">
            {title}
          </Text>
        ) : null}
      </View>
      <IconButton icon={X} variant="plain" accessibilityLabel={closeLabel} onPress={onClose} />
    </View>
  );
}

interface SheetPanelProps {
  progress: SharedValue<number>;
  height: SheetHeight;
  title: string | undefined;
  onClose: () => void;
  header: ReactNode;
  children: ReactNode;
  testID: string | undefined;
}

/** La hoja abajo: entra desde su propio alto y sigue al dedo desde el asa y el encabezado. */
function SheetPanel({
  progress,
  height,
  title,
  onClose,
  header,
  children,
  testID,
}: SheetPanelProps) {
  const { theme, rt } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const maxHeight = sheetMaxHeight(rt.screen.height, rt.insets.top, theme.space[12]);
  const fixedHeight = sheetFixedHeight(height, rt.screen.height, maxHeight);
  // Hasta medirla, se supone tan alta como la pantalla: así entra siempre desde fuera.
  const sheetHeight = useSharedValue(rt.screen.height);
  const drag = useSharedValue(0);
  const settle = springConfig(spring.sheet);

  const pan = usePanGesture({
    activeOffsetY: [-8, 8],
    onUpdate: (event) => {
      'worklet';
      drag.set(sheetDragOffset(event.translationY));
    },
    onDeactivate: (event) => {
      'worklet';
      if (shouldDismissSheet(event.translationY, event.velocityY, sheetHeight.get())) {
        scheduleOnRN(onClose);
        return;
      }
      drag.set(withSpring(0, settle));
      scheduleOnRN(triggerHaptic, 'light');
    },
  });

  const panelStyle = useAnimatedStyle(() => {
    // Sin pasar de 1: el rebote del resorte despegaría la hoja del borde de abajo.
    const entered = Math.min(progress.get(), 1);
    return {
      transform: [
        { translateY: drag.get() + (reduceMotion ? 0 : (1 - entered) * sheetHeight.get()) },
      ],
    };
  });
  // Con "reducir movimiento" entra con fundido: al relleno (`fade`) y al contenido, no al contenedor
  // (ver GlassSurface).
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? settledOpacity(progress.get()) : 1,
  }));

  return (
    <Animated.View
      style={[styles.sheetFrame, panelStyle]}
      onLayout={(event) => {
        sheetHeight.set(event.nativeEvent.layout.height);
      }}
    >
      <GlassSurface
        level="sheet"
        {...(reduceMotion ? { fade: progress } : {})}
        role="dialog"
        aria-modal
        accessibilityViewIsModal
        accessibilityLabel={title}
        style={styles.sheet(fixedHeight, maxHeight)}
        testID={testID}
      >
        <Animated.View style={[styles.sheetBody, fadeStyle]}>
          <GestureDetector gesture={pan}>
            <View style={styles.handleArea}>
              <View style={styles.grabber} />
              {header}
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  sheetFrame: {
    width: '100%',
    maxWidth: componentSize.dialogMaxWidth * 1.25,
  },
  sheet: (fixedHeight: number | undefined, maxHeight: number) => ({
    height: fixedHeight,
    maxHeight,
    boxShadow: theme.elevation.e3,
  }),
  sheetBody: {
    flexShrink: 1,
    flexGrow: 1,
  },
  handleArea: {
    paddingTop: theme.space[2],
    paddingHorizontal: theme.layout.cardPadding,
  },
  grabber: {
    alignSelf: 'center',
    width: componentSize.sheetGrabber.width,
    height: componentSize.sheetGrabber.height,
    marginBottom: theme.space[1],
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.inkSubtle,
  },
  header: {
    minHeight: theme.layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
  },
  title: {
    flex: 1,
  },
  scroll: {
    flexShrink: 1,
  },
  content: {
    gap: theme.space[4],
  },
  // Como diálogo, el panel ya tiene su padding; en la hoja lo ponen el contenido y el pie, y el
  // último bloque deja libre la zona segura de abajo.
  sheetContent: (last: boolean) => ({
    paddingHorizontal: theme.layout.cardPadding,
    paddingTop: theme.space[2],
    paddingBottom: last ? rt.insets.bottom + theme.space[6] : theme.space[4],
  }),
  footer: {
    gap: theme.space[3],
  },
  sheetFooter: {
    paddingHorizontal: theme.layout.cardPadding,
    paddingTop: theme.space[2],
    paddingBottom: rt.insets.bottom + theme.space[4],
  },
}));
