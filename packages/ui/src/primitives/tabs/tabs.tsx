import { useState } from 'react';
import { Pressable, ScrollView, View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { focusRing } from '../../lib/focus-ring';
import { triggerHaptic } from '../../motion/haptics';
import { useSlideIndicator, type SlotLayout } from '../../motion/use-slide-indicator';
import { componentSize } from '../../tokens';
import { Badge } from '../badge/badge';
import { Text } from '../text/text';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  /** Número opcional junto a la etiqueta (por ejemplo, pendientes). */
  count?: number;
}

export interface TabsProps<T extends string> extends Pick<ViewProps, 'style' | 'testID'> {
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nombre de la lista de pestañas para el lector de pantalla. */
  accessibilityLabel: string;
}

/**
 * P31 · Tabs: pestañas internas de una pantalla con un subrayado que se desliza a la elegida (M06).
 * Si no caben, se desplazan en horizontal. Solo es la barra: la pantalla muestra el contenido.
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  accessibilityLabel,
  style,
  testID,
}: TabsProps<T>) {
  const [layouts, setLayouts] = useState<Partial<Record<T, SlotLayout>>>({});
  const indicatorStyle = useSlideIndicator(layouts[value]);

  return (
    <View style={[styles.root, style]} testID={testID}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View
          accessibilityRole="tablist"
          accessibilityLabel={accessibilityLabel}
          style={styles.row}
        >
          {tabs.map((tab) => {
            const selected = tab.value === value;
            return (
              <Pressable
                key={tab.value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={
                  tab.count === undefined ? tab.label : `${tab.label}, ${tab.count}`
                }
                onPress={() => {
                  if (selected) return;
                  triggerHaptic('selection');
                  onChange(tab.value);
                }}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  setLayouts((current) => ({ ...current, [tab.value]: { x, width } }));
                }}
                style={[styles.tab, styles.focus]}
              >
                <Text variant="label" tone={selected ? 'primary' : 'muted'}>
                  {tab.label}
                </Text>
                {tab.count === undefined ? null : (
                  <Badge label={tab.count} max={99} tone={selected ? 'primary' : 'neutral'} />
                )}
              </Pressable>
            );
          })}
          <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  focus: focusRing(theme.colors.focus),
  root: {
    borderBottomWidth: 1,
    borderBottomColor: theme.glass.card.border,
  },
  row: {
    flexDirection: 'row',
  },
  tab: {
    minHeight: theme.layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.space[4],
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: componentSize.tabIndicator,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    boxShadow: theme.elevation.glow,
  },
}));
