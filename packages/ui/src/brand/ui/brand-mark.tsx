import { useEffect, useId, useRef } from 'react';
import { StyleSheet as NativeStyleSheet, View, type ViewProps } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, Path } from 'react-native-svg';
import { useUnistyles } from 'react-native-unistyles';

import { useReduceMotion } from '../../motion/accessibility-preferences';
import { useAppActive } from '../../motion/use-app-active';
import { timing, type ColorScheme } from '../../tokens';
import {
  ENTRANCE_DONE,
  ENTRANCE_DURATION,
  entranceAt,
  TWINKLE_PERIOD,
  twinkleScale,
} from '../entrance';
import { MARK_VARIANT_MIN_SIZE, SPARKLE } from '../geometry';
import {
  brandMarkLayers,
  brandMarkParts,
  brandVariantForSize,
  markViewBox,
  type BrandMarkVariant,
} from '../mark';
import { ORBIT, orbitFrame, type OrbitFrame } from '../orbit';
import type { SvgParts } from '../svg-tree';

import { SvgPartsView } from './svg-parts-view';
import { useBrandClock } from './use-brand-clock';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface BrandMarkProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Lado en px. */
  size: number;
  /** `auto` elige por tamaño: ≥ 160 animada, 96–159 con íconos, 32–95 con puntos, ≤ 31 monocromo. */
  variant?: BrandMarkVariant | 'auto';
  /** Fondo sobre el que va; por defecto, el tema activo. */
  scheme?: ColorScheme;
  /** Color de la silueta en `mono`. */
  monoColor?: string;
  /** M21 al montar (solo la animada). Para repetirla, cambiar la `key` del componente. */
  entrance?: boolean;
  /** Se llama una vez al terminar M21 (o enseguida si no hay entrada). El arranque lo espera. */
  onEntranceEnd?: () => void;
  /** Nombre accesible (`brand.name`). Sin él, el logo es decorativo. */
  accessibilityLabel?: string;
}

/**
 * BR01 · Logo de Gravyx Ascenda (§11.2–§11.4). La variante animada corre M21 (entrada y ascenso) y
 * luego M20 (órbita, una vuelta cada 36 s, íconos siempre derechos); el destello titila (M23) en la
 * animada y en la de íconos ≥ 160 px. Todo se pausa con la app en segundo plano; con "reducir
 * movimiento" queda la pose de reposo.
 *
 * La entrada (2,4 s, una vez) se dibuja en JS cuadro a cuadro. Al terminar, M20 y M23 pasan al
 * hilo de UI (`LayeredMark`): en Android, rehacer el SVG entero en cada cuadro no llegaba a 60 FPS
 * (F1.9).
 */
export function BrandMark({
  size,
  variant = 'auto',
  scheme,
  monoColor,
  entrance = true,
  onEntranceEnd,
  accessibilityLabel,
  style,
  testID,
}: BrandMarkProps) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const appActive = useAppActive();
  const id = `mark-${useId().replace(/[^\w-]/g, '')}`;

  const resolved = variant === 'auto' ? brandVariantForSize(size) : variant;
  const animated = resolved === 'animated';
  const twinkles = animated || (resolved === 'icons' && size >= MARK_VARIANT_MIN_SIZE.animated);
  const moving = (animated || twinkles) && !reduceMotion;

  const entranceOn = animated && entrance && !reduceMotion;
  const entranceEnd = entranceOn ? ENTRANCE_DURATION : 0;
  // El reloj de JS solo corre durante la entrada y se detiene solo al terminarla.
  const elapsed = useBrandClock(entranceOn && appActive, entranceEnd);
  const finished = elapsed >= entranceEnd;
  const entranceState = entranceOn && !finished ? entranceAt(elapsed) : ENTRANCE_DONE;

  // Aviso de fin de la entrada, una sola vez.
  const endedRef = useRef(false);
  useEffect(() => {
    if (!finished || endedRef.current) return;
    endedRef.current = true;
    onEntranceEnd?.();
  }, [finished, onEntranceEnd]);

  const label = accessibilityLabel
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
    : {
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
      };
  const resolvedScheme = scheme ?? theme.scheme;

  if (moving && finished) {
    return (
      <View {...label} style={[{ width: size, height: size }, style]} testID={testID}>
        <LayeredMark
          size={size}
          variant={resolved}
          scheme={resolvedScheme}
          idPrefix={id}
          orbit={animated}
          running={appActive}
        />
      </View>
    );
  }

  const parts = brandMarkParts({
    variant: resolved,
    scheme: resolvedScheme,
    idPrefix: id,
    phi: ORBIT.restPhi,
    entrance: entranceState,
    sparkleScale: entranceState.sparkleScale,
    ...(monoColor === undefined ? {} : { monoColor }),
  });

  return (
    <View {...label} style={[{ width: size, height: size }, style]} testID={testID}>
      <Svg width={size} height={size} viewBox={markViewBox(resolved)}>
        <SvgPartsView parts={parts} />
      </Svg>
    </View>
  );
}

/** Lado máximo de un ícono en la órbita (`31 + 7·d` con d = 1), en unidades del lienzo. */
const MAX_SLOT = 38;

const linear = (duration: number) => ({
  duration,
  easing: Easing.linear,
  reduceMotion: ReduceMotion.Never,
});

/** Lleva `value` de su valor actual a `to` y después repite `from → to` sin fin, a ritmo constante. */
function loop(value: SharedValue<number>, from: number, to: number, periodMs: number) {
  const left = Math.max(0, (to - value.get()) / (to - from));
  value.set(
    withSequence(
      withTiming(to, linear(periodMs * left)),
      withRepeat(
        withSequence(withTiming(from, { duration: 0 }), withTiming(to, linear(periodMs))),
        -1,
      ),
    ),
  );
}

/**
 * M20 y M23 en el hilo de UI. Capas, de abajo hacia arriba: trazo de atrás, íconos de atrás,
 * planeta, trazo de adelante, íconos de adelante, estela y estrella, destello. Solo se redibujan los
 * dos trazos (su `d`); los íconos se mueven con `transform` y cambian de capa con la opacidad (cada
 * uno está en las dos), y el destello se escala como vista.
 */
function LayeredMark({
  size,
  variant,
  scheme,
  idPrefix,
  orbit,
  running,
}: {
  size: number;
  variant: 'animated' | 'icons';
  scheme: ColorScheme;
  idPrefix: string;
  orbit: boolean;
  running: boolean;
}) {
  const layers = brandMarkLayers(scheme, idPrefix);
  const viewBox = markViewBox(variant);
  const [minX = 0, minY = 0, width = 200] = viewBox.split(' ').map(Number);
  const unit = size / width;

  const phi = useSharedValue<number>(ORBIT.restPhi);
  const twinkleMs = useSharedValue(0);

  useEffect(() => {
    if (!running) {
      cancelAnimation(phi);
      cancelAnimation(twinkleMs);
      return undefined;
    }
    if (orbit) loop(phi, ORBIT.restPhi, ORBIT.restPhi + 2 * Math.PI, timing.orbitTurn);
    loop(twinkleMs, 0, TWINKLE_PERIOD, TWINKLE_PERIOD);
    return () => {
      cancelAnimation(phi);
      cancelAnimation(twinkleMs);
    };
  }, [running, orbit, phi, twinkleMs]);

  const frame = useDerivedValue(() => orbitFrame(phi.get()));
  const ringProps = useAnimatedProps(() => ({ d: frame.get().ringPath }));
  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: twinkleScale(twinkleMs.get()) }],
  }));
  const sparkleOrigin = `${((SPARKLE.cx - minX) * unit).toString()}px ${((SPARKLE.cy - minY) * unit).toString()}px`;

  const svgLayer = (key: string, children: React.ReactNode) => (
    <View key={key} pointerEvents="none" style={NativeStyleSheet.absoluteFill}>
      <Svg width={size} height={size} viewBox={viewBox}>
        {children}
      </Svg>
    </View>
  );
  const ring = (front: boolean) =>
    svgLayer(
      front ? 'ring-front' : 'ring-back',
      <>
        <Defs>
          <SvgPartsView parts={{ defs: [], body: layers.ringDefs }} />
        </Defs>
        <AnimatedPath
          {...layers.ringAttrs}
          {...(front ? { clipPath: layers.ringFrontClip } : { opacity: layers.ringBackOpacity })}
          animatedProps={ringProps}
        />
      </>,
    );
  const slots = (layer: 'back' | 'front') =>
    ORBIT.slots.flatMap((moduleId, index) =>
      moduleId === null
        ? []
        : [
            <SlotView
              key={`${layer}-${moduleId}`}
              frame={frame}
              index={ORBIT.slots.slice(0, index).filter((slot) => slot !== null).length}
              layer={layer}
              unit={unit}
              minX={minX}
              minY={minY}
              parts={layers.icons[moduleId]}
            />,
          ],
    );

  return (
    <>
      {ring(false)}
      {slots('back')}
      {svgLayer('planet', <SvgPartsView parts={layers.planet} />)}
      {ring(true)}
      {slots('front')}
      {svgLayer('overlay', <SvgPartsView parts={layers.overlay} />)}
      <Animated.View
        pointerEvents="none"
        style={[NativeStyleSheet.absoluteFill, { transformOrigin: sparkleOrigin }, sparkleStyle]}
      >
        <Svg width={size} height={size} viewBox={viewBox}>
          <SvgPartsView parts={{ defs: [], body: [layers.sparkle] }} />
        </Svg>
      </Animated.View>
    </>
  );
}

/** Un ícono de la órbita en una capa: visible solo cuando su lado (atrás o adelante) coincide. */
function SlotView({
  frame,
  index,
  layer,
  unit,
  minX,
  minY,
  parts,
}: {
  frame: SharedValue<OrbitFrame>;
  index: number;
  layer: 'back' | 'front';
  unit: number;
  minX: number;
  minY: number;
  parts: SvgParts;
}) {
  const box = MAX_SLOT * unit;
  const slotStyle = useAnimatedStyle(() => {
    const slot = frame.get().slots[index];
    if (!slot) return { opacity: 0 };
    return {
      opacity: slot.layer === layer ? slot.opacity : 0,
      transform: [
        { translateX: (slot.x - minX) * unit - box / 2 },
        { translateY: (slot.y - minY) * unit - box / 2 },
        { scale: slot.size / MAX_SLOT },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, left: 0, width: box, height: box }, slotStyle]}
    >
      <Svg width={box} height={box} viewBox="0 0 200 200">
        <SvgPartsView parts={parts} />
      </Svg>
    </Animated.View>
  );
}
