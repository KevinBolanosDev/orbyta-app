import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Sparkline } from '../../charts/sparkline';
import type { NumberLocale } from '../../lib/format-number';
import { DeltaText } from '../amount-text/amount-text';
import { Text } from '../text/text';

export interface StatTileProps extends Pick<ViewProps, 'style' | 'testID'> {
  label: string;
  /** La cifra: un AmountText (con `animate` para M03) o un texto ya formateado. */
  value: ReactNode;
  /** Variación en % como texto decimal (`"2.4"`), igual que DeltaText. */
  delta?: string;
  locale?: NumberLocale;
  /** Serie para la sparkline (G01) a la derecha. */
  trend?: readonly number[];
  /** Resumen de la serie para el lector de pantalla. */
  trendLabel?: string;
}

/** P30 · StatTile: etiqueta, cifra, variación y sparkline opcional. */
export function StatTile({
  label,
  value,
  delta,
  locale,
  trend,
  trendLabel,
  style,
  testID,
}: StatTileProps) {
  return (
    <View style={[styles.tile, style]} testID={testID}>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
      {typeof value === 'string' ? <Text variant="numL">{value}</Text> : value}
      {delta !== undefined || trend ? (
        <View style={styles.footer}>
          {delta === undefined ? (
            <View />
          ) : (
            <DeltaText value={delta} {...(locale ? { locale } : {})} variant="caption" />
          )}
          {trend && trend.length > 1 ? (
            <Sparkline
              values={trend}
              accessibilityLabel={trendLabel ?? label}
              width={72}
              height={24}
              animate
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  tile: {
    gap: theme.space[1],
    minWidth: 140,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
  },
}));
