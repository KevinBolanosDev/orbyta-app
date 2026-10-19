import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../button/button';
import { Text } from '../text/text';

export interface SectionHeaderProps extends Pick<ViewProps, 'style' | 'testID'> {
  title: string;
  /** Acción a la derecha, por ejemplo "Ver todo". */
  actionLabel?: string;
  onAction?: () => void;
}

/** P27 · SectionHeader: título de sección y una acción opcional. */
export function SectionHeader({ title, actionLabel, onAction, style, testID }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]} testID={testID}>
      <Text variant="titleS" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="ghost" size="s" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[3],
    minHeight: theme.layout.minTouchTarget,
  },
  title: {
    flexShrink: 1,
  },
}));
