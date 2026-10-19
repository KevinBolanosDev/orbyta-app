import Search from 'lucide-react-native/icons/search';
import X from 'lucide-react-native/icons/x';
import { useEffect, useRef, useState, type ComponentRef, type Ref } from 'react';
import { Pressable, TextInput, View, type ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { fontFamily, MAX_FONT_SCALE, typeScale } from '../../tokens';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

/** Espera desde la última tecla antes de buscar. */
export const SEARCH_DEBOUNCE_MS = 250;

export interface SearchBarProps extends Pick<ViewProps, 'style' | 'testID'> {
  value: string;
  /** Cada tecla (para mostrar lo escrito). */
  onChangeText: (text: string) => void;
  /** La búsqueda, 250 ms después de la última tecla (o al instante al limpiar). */
  onSearch?: (query: string) => void;
  /** Texto de ayuda y nombre accesible ("Buscar comercio"). */
  placeholder: string;
  /** Nombre accesible del botón × ("Borrar búsqueda"). */
  clearLabel: string;
  /** Con esto, mientras el campo tiene foco aparece "Cancelar": limpia y cierra el teclado. */
  cancelLabel?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

/** P33 · SearchBar: lupa, campo, × para limpiar y "Cancelar"; avisa la búsqueda con 250 ms de espera. */
export function SearchBar({
  value,
  onChangeText,
  onSearch,
  placeholder,
  clearLabel,
  cancelLabel,
  onCancel,
  autoFocus,
  style,
  testID,
  ref,
}: SearchBarProps) {
  const { theme } = useUnistyles();
  const [focused, setFocused] = useState(false);
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  // Busca 250 ms después de la última tecla; vaciar el campo busca al instante.
  useEffect(() => {
    if (value === '') {
      onSearchRef.current?.('');
      return undefined;
    }
    const timer = setTimeout(() => {
      onSearchRef.current?.(value);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [value]);

  return (
    <View style={[styles.row, style]} testID={testID}>
      <View style={styles.field(focused)}>
        <Icon icon={Search} size="list" tone="muted" />
        <TextInput
          ref={ref}
          accessibilityRole="search"
          accessibilityLabel={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.inkSubtle}
          selectionColor={theme.colors.primary}
          cursorColor={theme.colors.primary}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          returnKeyType="search"
          autoCorrect={false}
          autoFocus={autoFocus}
          onSubmitEditing={() => {
            onSearchRef.current?.(value);
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
          }}
          style={styles.input}
        />
        {value === '' ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={clearLabel}
            hitSlop={theme.space[3]}
            onPress={() => {
              onChangeText('');
            }}
          >
            <Icon icon={X} size="list" tone="muted" />
          </Pressable>
        )}
      </View>
      {cancelLabel && onCancel && focused ? (
        <Button
          label={cancelLabel}
          variant="ghost"
          size="s"
          onPress={() => {
            onChangeText('');
            onCancel();
          }}
        />
      ) : null}
    </View>
  );
}

const { bodyL } = typeScale;

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
  },
  field: (focused: boolean) => ({
    flex: 1,
    minHeight: theme.layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: focused ? theme.colors.primary : theme.glass.card.border,
    backgroundColor: theme.glass.card.fill,
  }),
  input: {
    flex: 1,
    alignSelf: 'stretch',
    color: theme.colors.ink,
    fontFamily: fontFamily[bodyL.family],
    fontSize: bodyL.compact.fontSize,
    _web: { outlineStyle: 'none' },
  },
}));
