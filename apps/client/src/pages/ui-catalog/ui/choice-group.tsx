import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/shared/ui';

interface ChoiceGroupProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Grupo de opciones excluyentes (radio) para la barra del catálogo.
 * TODO(F1.5): reemplazar por P12 SegmentedControl cuando exista.
 */
export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <View style={styles.group}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => {
                onChange(option.value);
              }}
              style={styles.option(selected)}
            >
              <Text variant="label" tone={selected ? 'onPrimary' : 'default'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  group: {
    gap: theme.space[2],
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.layout.minTouchGap,
  },
  option: (selected: boolean) => ({
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.space[4],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: selected ? theme.colors.primary : theme.glass.card.border,
    backgroundColor: selected ? theme.colors.primary : theme.glass.card.fill,
  }),
}));
