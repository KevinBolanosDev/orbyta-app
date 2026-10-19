import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { glassGeometry } from '../../tokens';

const { size, strokeWidth, inset } = glassGeometry.hudCorner;

/** Esquinas HUD en L (arriba a la izquierda y abajo a la derecha) de las tarjetas héroe (§3.1). */
export function HudCorners() {
  return (
    <>
      <View pointerEvents="none" style={[styles.corner, styles.topStart]} />
      <View pointerEvents="none" style={[styles.corner, styles.bottomEnd]} />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  corner: {
    position: 'absolute',
    width: size,
    height: size,
    borderColor: theme.colors.primary,
  },
  topStart: {
    top: inset,
    left: inset,
    borderTopWidth: strokeWidth,
    borderLeftWidth: strokeWidth,
  },
  bottomEnd: {
    bottom: inset,
    right: inset,
    borderBottomWidth: strokeWidth,
    borderRightWidth: strokeWidth,
  },
}));
