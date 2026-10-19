import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { SegmentedControl, Text } from '@/shared/ui';

interface ChoiceGroupProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Grupo de opciones excluyentes de la barra del catálogo: etiqueta y P12 SegmentedControl. */
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
      <SegmentedControl
        accessibilityLabel={label}
        options={options}
        value={value}
        onChange={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  group: {
    gap: theme.space[2],
  },
}));
