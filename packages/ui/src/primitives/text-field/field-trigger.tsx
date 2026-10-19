import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Icon, type IconComponent } from '../icon/icon';
import { Text } from '../text/text';

import { FieldBox, FieldFrame } from './field-frame';

export interface FieldTriggerProps {
  label: string;
  /** Lo elegido, ya formateado; sin valor se muestra `placeholder`. */
  display: string | undefined;
  placeholder?: string | undefined;
  helper?: string | undefined;
  error?: string | undefined;
  disabled?: boolean | undefined;
  /** Si la hoja está abierta. */
  expanded: boolean;
  icon?: IconComponent;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string | undefined;
}

/**
 * Campo que abre una hoja (Select P10, DatePicker P11): se ve como un TextField, pero es un botón que
 * dice su etiqueta y lo elegido.
 */
export function FieldTrigger({
  label,
  display,
  placeholder,
  helper,
  error,
  disabled = false,
  expanded,
  icon = ChevronDown,
  onPress,
  style,
  testID,
}: FieldTriggerProps) {
  return (
    <FieldFrame label={label} helper={helper} error={error} style={style} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${display ?? placeholder ?? ''}`.replace(/, $/, '')}
        accessibilityHint={error ?? helper}
        accessibilityState={{ disabled, expanded }}
        disabled={disabled}
        onPress={onPress}
      >
        <FieldBox focused={expanded} invalid={error !== undefined} disabled={disabled}>
          <Text
            variant="bodyL"
            tone={display === undefined ? 'subtle' : 'default'}
            numberOfLines={1}
            style={styles.value}
          >
            {display ?? placeholder ?? ''}
          </Text>
          <Icon icon={icon} size="list" tone="muted" />
        </FieldBox>
      </Pressable>
    </FieldFrame>
  );
}

const styles = StyleSheet.create({
  value: {
    flex: 1,
  },
});
