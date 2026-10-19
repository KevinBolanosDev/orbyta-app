import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export interface AccessibilityPreferences {
  /** `undefined` sigue al sistema; `true`/`false` lo fuerza (opción de Ajustes o del catálogo). */
  reduceMotion?: boolean | undefined;
  /** `undefined` sigue al sistema; `true` usa el relleno sólido en vez del vidrio. */
  reduceTransparency?: boolean | undefined;
}

const AccessibilityPreferencesContext = createContext<AccessibilityPreferences>({});

/**
 * Permite a la app forzar "reducir movimiento" y "reducir transparencia" por encima del sistema.
 * Sin este provider, los componentes siguen la configuración del sistema.
 */
export function AccessibilityPreferencesProvider({
  reduceMotion,
  reduceTransparency,
  children,
}: AccessibilityPreferences & { children: ReactNode }) {
  const value = useMemo(
    () => ({ reduceMotion, reduceTransparency }),
    [reduceMotion, reduceTransparency],
  );
  return (
    <AccessibilityPreferencesContext value={value}>{children}</AccessibilityPreferencesContext>
  );
}

/** `true` si hay que quitar desplazamientos, rebotes y bucles (§4.1, regla 5). */
export function useReduceMotion(): boolean {
  const { reduceMotion } = use(AccessibilityPreferencesContext);
  const system = useReducedMotion();
  return reduceMotion ?? system;
}

/** `true` si el vidrio debe usar el relleno sólido de respaldo (§3.4). */
export function useReduceTransparency(): boolean {
  const { reduceTransparency } = use(AccessibilityPreferencesContext);
  const system = useSystemReduceTransparency();
  return reduceTransparency ?? system;
}

const REDUCED_TRANSPARENCY_QUERY = '(prefers-reduced-transparency: reduce)';

type MediaQueryListener = (event: { matches: boolean }) => void;

interface MediaQueryListLike {
  matches: boolean;
  addEventListener(type: 'change', listener: MediaQueryListener): void;
  removeEventListener(type: 'change', listener: MediaQueryListener): void;
}

// En web se lee la media query; el paquete no depende de los tipos del DOM.
function webMediaQuery(): MediaQueryListLike | undefined {
  const scope = globalThis as { matchMedia?: (query: string) => MediaQueryListLike };
  return scope.matchMedia?.(REDUCED_TRANSPARENCY_QUERY);
}

/** Preferencia del sistema: iOS y la web la exponen; Android no tiene la opción (queda en `false`). */
function useSystemReduceTransparency(): boolean {
  const [enabled, setEnabled] = useState(() =>
    Platform.OS === 'web' ? (webMediaQuery()?.matches ?? false) : false,
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      const query = webMediaQuery();
      if (!query) return undefined;
      const onChange: MediaQueryListener = (event) => {
        setEnabled(event.matches);
      };
      query.addEventListener('change', onChange);
      return () => {
        query.removeEventListener('change', onChange);
      };
    }
    let mounted = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (mounted) setEnabled(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setEnabled,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}
