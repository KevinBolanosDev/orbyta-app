import { useEffect, useRef, useState } from 'react';

import { duration } from '../tokens';

import { useReduceMotion } from './accessibility-preferences';
import { easingFunction } from './easing';

export interface CountUpOptions {
  /** Duración en ms; por defecto `dur.showcase`. */
  duration?: number;
  /** Valor inicial la primera vez; por defecto 0. Luego cuenta desde el valor anterior. */
  from?: number;
}

/**
 * M03 · Conteo de cifras: devuelve el número que hay que mostrar en cada cuadro, de `from` (o del
 * valor anterior) a `value`, con `power2.out`. Corre en JS con requestAnimationFrame porque el
 * texto se formatea en React (moneda, modo privado); hay una sola cifra protagonista por pantalla.
 * El número intermedio es solo para mostrar: el monto real sigue siendo `value`.
 * Con "reducir movimiento" devuelve directamente el valor final.
 */
export function useCountUp(
  value: number,
  { duration: durationMs = duration.showcase, from = 0 }: CountUpOptions = {},
): number {
  const reduceMotion = useReduceMotion();
  const [display, setDisplay] = useState(from);
  const shownRef = useRef(from);

  useEffect(() => {
    if (reduceMotion) {
      shownRef.current = value;
      return undefined;
    }
    const start = shownRef.current;
    if (start === value) return undefined;
    const ease = easingFunction('power2Out');
    const startedAt = performance.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min((performance.now() - startedAt) / durationMs, 1);
      const next = t === 1 ? value : start + (value - start) * ease(t);
      shownRef.current = next;
      setDisplay(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs, reduceMotion]);

  return reduceMotion ? value : display;
}
