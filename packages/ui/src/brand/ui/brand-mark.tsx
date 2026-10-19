import { useEffect, useId, useRef } from 'react';
import { View, type ViewProps } from 'react-native';
import Svg from 'react-native-svg';
import { useUnistyles } from 'react-native-unistyles';

import { useReduceMotion } from '../../motion/accessibility-preferences';
import { useAppActive } from '../../motion/use-app-active';
import { timing, type ColorScheme } from '../../tokens';
import { ENTRANCE_DONE, ENTRANCE_DURATION, entranceAt, twinkleScale } from '../entrance';
import { MARK_VARIANT_MIN_SIZE } from '../geometry';
import { brandMarkParts, brandVariantForSize, markViewBox, type BrandMarkVariant } from '../mark';
import { ORBIT, orbitPhase } from '../orbit';

import { SvgPartsView } from './svg-parts-view';
import { useBrandClock } from './use-brand-clock';

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
  const elapsed = useBrandClock(moving && appActive);

  const entranceOn = animated && entrance && !reduceMotion;
  const entranceEnd = entranceOn ? ENTRANCE_DURATION : 0;
  const entranceState = entranceOn ? entranceAt(elapsed) : ENTRANCE_DONE;
  const afterEntrance = Math.max(0, elapsed - entranceEnd);
  const phi =
    animated && !reduceMotion ? orbitPhase(afterEntrance, timing.orbitTurn) : ORBIT.restPhi;
  const sparkleScale =
    twinkles && !reduceMotion && elapsed >= entranceEnd
      ? twinkleScale(afterEntrance)
      : entranceState.sparkleScale;

  // Aviso de fin de la entrada, una sola vez.
  const endedRef = useRef(false);
  const finished = elapsed >= entranceEnd;
  useEffect(() => {
    if (!finished || endedRef.current) return;
    endedRef.current = true;
    onEntranceEnd?.();
  }, [finished, onEntranceEnd]);

  const parts = brandMarkParts({
    variant: resolved,
    scheme: scheme ?? theme.scheme,
    idPrefix: id,
    phi,
    entrance: entranceState,
    sparkleScale,
    ...(monoColor === undefined ? {} : { monoColor }),
  });

  const label = accessibilityLabel
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
    : {
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
      };

  return (
    <View {...label} style={[{ width: size, height: size }, style]} testID={testID}>
      <Svg width={size} height={size} viewBox={markViewBox(resolved)}>
        <SvgPartsView parts={parts} />
      </Svg>
    </View>
  );
}
