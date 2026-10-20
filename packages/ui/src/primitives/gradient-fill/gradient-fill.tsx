import { useId } from 'react';
import { StyleSheet as NativeStyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { cssAngleToSvgVector, svgStopColor, type LinearGradientToken } from '../../lib/gradient';

export interface GradientFillProps extends Pick<ViewProps, 'style' | 'testID'> {
  gradient: LinearGradientToken;
}

/**
 * Pinta un degradado lineal que llena a su contenedor (posición absoluta). Usa SVG para verse igual
 * en web y Android. Lo usan el catálogo y, desde F1.4, el FAB, LevelBadge, HoloCard y logros.
 * Es decorativo: no recibe toques ni lo lee el lector de pantalla.
 */
export function GradientFill({ gradient, style, testID }: GradientFillProps) {
  // Id único por instancia: dos degradados en la misma página no pueden compartir `url(#id)`.
  const id = `gradient-${useId().replace(/[^\w-]/g, '')}`;
  const vector = cssAngleToSvgVector(gradient.angleDeg);
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[NativeStyleSheet.absoluteFill, style]}
      testID={testID}
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} {...vector}>
            {gradient.stops.map((stop) => (
              <Stop key={stop.offset} offset={stop.offset} {...svgStopColor(stop.color)} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
