// Cola de toasts (P23) como funciones puras, probadas sin React.

import type { IconComponent } from '../icon/icon';

/** info · success (éxito) · error · undo (deshacer, con acción). */
export type ToastTone = 'info' | 'success' | 'error' | 'undo';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** Texto de la acción ("Deshacer"); se muestra si también hay `onAction`. */
  actionLabel?: string;
  onAction?: () => void;
  /** Tiempo en pantalla en ms; por defecto 4 s, 6 s si tiene acción y 5 s si es un logro. */
  duration?: number;
  /** X05: se muestra como toast de logro; `message` es el título del logro. */
  achievement?: ToastAchievement;
}

export interface ToastAchievement {
  /** "LOGRO DESBLOQUEADO". */
  overline: string;
  /** "+50 XP". */
  xp?: string;
  icon?: IconComponent;
}

export interface ToastEntry extends ToastOptions {
  id: number;
  tone: ToastTone;
  duration: number;
  /** `true` mientras sale (200 ms); después se quita de la cola. */
  leaving: boolean;
}

/** Máximo de toasts a la vista: al llegar uno más, el más viejo empieza a salir. */
export const MAX_VISIBLE_TOASTS = 3;

/**
 * Agrega un toast al final. Si quedan más de `max` sin estar saliendo, los más viejos pasan a
 * `leaving` (salen con su animación en vez de desaparecer de golpe).
 */
export function enqueueToast(
  queue: readonly ToastEntry[],
  entry: ToastEntry,
  max: number = MAX_VISIBLE_TOASTS,
): ToastEntry[] {
  const next = [...queue, entry];
  let excess = next.filter((toast) => !toast.leaving).length - max;
  return next.map((toast) => {
    if (excess > 0 && !toast.leaving) {
      excess -= 1;
      return { ...toast, leaving: true };
    }
    return toast;
  });
}

/** Marca un toast para que salga. */
export function dismissToast(queue: readonly ToastEntry[], id: number): ToastEntry[] {
  return queue.map((toast) =>
    toast.id === id && !toast.leaving ? { ...toast, leaving: true } : toast,
  );
}

/** Quita de la cola un toast que ya terminó de salir. */
export function removeToast(queue: readonly ToastEntry[], id: number): ToastEntry[] {
  return queue.filter((toast) => toast.id !== id);
}
