import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Hápticas del catálogo de movimiento (§4.3, columna "Háptica"). */
export type HapticKind = 'light' | 'medium' | 'selection' | 'success';

const ignore = () => undefined;

function play(kind: HapticKind): Promise<void> {
  switch (kind) {
    case 'light':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'medium':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'selection':
      return Haptics.selectionAsync();
    case 'success':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

/**
 * Dispara una háptica sin esperarla. Es un complemento: en web no hay, y si el equipo no la soporta
 * el error se ignora.
 */
export function triggerHaptic(kind: HapticKind): void {
  if (Platform.OS === 'web') return;
  // Dentro de una promesa para atrapar también un error síncrono del módulo nativo.
  Promise.resolve()
    .then(() => play(kind))
    .catch(ignore);
}
