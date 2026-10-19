import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

// `inactive` (iOS: centro de control, cambio de app) también pausa; `unknown` cuenta como activa.
// `AppState.currentState` viene tipado como texto libre, no como `AppStateStatus`.
const isActive = (state: string | null | undefined) =>
  state !== 'background' && state !== 'inactive';

/**
 * `false` mientras la app está en segundo plano (en web, con la pestaña oculta). Las animaciones en
 * bucle (orbes M09, reflejo en reposo M08) se pausan con esto para no gastar batería.
 */
export function useAppActive(): boolean {
  const [active, setActive] = useState(() => isActive(AppState.currentState));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setActive(isActive(state));
    });
    return () => {
      subscription.remove();
    };
  }, []);
  return active;
}
