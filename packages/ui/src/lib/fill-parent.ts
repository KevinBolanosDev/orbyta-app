// Estilo que ocupa todo el contenedor, para capas dentro de StyleSheet.create.
// React Native 0.88 ya no tipa `StyleSheet.absoluteFillObject`.
export const fillParent = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
} as const;
