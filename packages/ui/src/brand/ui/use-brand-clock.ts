import { useEffect, useRef, useState } from 'react';

/**
 * Reloj de las animaciones de marca: milisegundos acumulados mientras `running` es `true`. Al
 * pausar (app en segundo plano, "reducir movimiento") se detiene y luego sigue desde ahí.
 * Avanza con requestAnimationFrame y re-renderiza el logo cada cuadro (unos 20 nodos SVG).
 * TODO(F1.9): si M20 no llega a 60 FPS en Android, pasar el cálculo al hilo de UI (Reanimated).
 */
export function useBrandClock(running: boolean): number {
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    let last = performance.now();
    let frame = 0;
    const tick = () => {
      const now = performance.now();
      elapsedRef.current += now - last;
      last = now;
      setElapsed(elapsedRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [running]);

  return elapsed;
}
