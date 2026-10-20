import { useEffect, useRef, useState } from 'react';

/**
 * Reloj de la entrada del logo (M21): milisegundos acumulados mientras `running` es `true`. Al
 * pausar (app en segundo plano, "reducir movimiento") se detiene y luego sigue desde ahí. Se para
 * solo al llegar a `untilMs`. Avanza con requestAnimationFrame y re-renderiza el logo cada cuadro;
 * desde F1.9 solo cubre la entrada (2,4 s): la órbita y el destello van en el hilo de UI.
 */
export function useBrandClock(running: boolean, untilMs = Number.POSITIVE_INFINITY): number {
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!running || elapsedRef.current >= untilMs) return undefined;
    let last = performance.now();
    let frame = 0;
    const tick = () => {
      const now = performance.now();
      elapsedRef.current = Math.min(elapsedRef.current + now - last, untilMs);
      last = now;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current < untilMs) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [running, untilMs]);

  return elapsed;
}
