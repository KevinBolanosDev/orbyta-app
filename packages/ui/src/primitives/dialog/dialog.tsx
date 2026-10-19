import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../button/button';
import { CenteredPanel, Overlay } from '../overlay/overlay';
import { Text } from '../text/text';

export interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Texto de la acción ("Eliminar"). */
  confirmLabel: string;
  /** Texto de la salida ("Cancelar"); también cierra con el fondo, Escape o Atrás. */
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** La acción borra o no se puede deshacer: el botón va en `danger`. */
  destructive?: boolean;
  /** La acción está en curso: spinner y sin poder volver a tocarla. */
  confirmLoading?: boolean;
  testID?: string;
}

/**
 * P25 · Dialog: confirmación centrada con dos botones (M10, versión centrada). Para el lector de
 * pantalla es un `alertdialog` con el título como nombre.
 */
export function Dialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
  confirmLoading = false,
  testID,
}: DialogProps) {
  return (
    <Overlay visible={visible} onRequestClose={onCancel} placement="center">
      {(progress) => (
        <CenteredPanel
          progress={progress}
          role="alertdialog"
          accessibilityLabel={title}
          testID={testID}
        >
          <View style={styles.texts}>
            <Text variant="titleM" accessibilityRole="header">
              {title}
            </Text>
            {message ? <Text tone="muted">{message}</Text> : null}
          </View>
          <View style={styles.actions}>
            <Button
              label={cancelLabel}
              variant="secondary"
              onPress={onCancel}
              fullWidth
              style={styles.action}
            />
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={confirmLoading}
              fullWidth
              style={styles.action}
            />
          </View>
        </CenteredPanel>
      )}
    </Overlay>
  );
}

const styles = StyleSheet.create((theme) => ({
  texts: {
    gap: theme.space[2],
  },
  actions: {
    flexDirection: 'row',
    gap: theme.space[3],
    marginTop: theme.space[2],
  },
  action: {
    flex: 1,
  },
}));
