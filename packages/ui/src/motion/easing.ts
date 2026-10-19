import { Easing, ReduceMotion } from 'react-native-reanimated';

import { easing, type EasingToken } from '../tokens';

/** Curva del token para las animaciones de Reanimated (`withTiming`). */
export function toEasing(token: EasingToken) {
  const [x1, y1, x2, y2] = easing[token];
  return Easing.bezier(x1, y1, x2, y2);
}

/** La misma curva como función de JS `t → progreso` (para animaciones fuera del hilo de UI). */
export function easingFunction(token: EasingToken): (t: number) => number {
  const [x1, y1, x2, y2] = easing[token];
  return Easing.bezierFn(x1, y1, x2, y2);
}

/**
 * Configuración de `withTiming`. "Reducir movimiento" lo resuelven los hooks (con la preferencia del
 * sistema o la de la app), así que Reanimated no debe saltarse la animación por su cuenta: eso
 * eliminaría también el fundido de 150 ms que sí se mantiene (§4.1).
 */
export function timingConfig(durationMs: number, token: EasingToken) {
  return { duration: durationMs, easing: toEasing(token), reduceMotion: ReduceMotion.Never };
}

/** Fundido lineal que queda con "reducir movimiento". */
export function fadeConfig(durationMs: number) {
  return { duration: durationMs, easing: Easing.linear, reduceMotion: ReduceMotion.Never };
}

/** Configuración de `withSpring` para un token de resorte. */
export function springConfig(token: { damping: number; stiffness?: number }) {
  return { ...token, reduceMotion: ReduceMotion.Never };
}
