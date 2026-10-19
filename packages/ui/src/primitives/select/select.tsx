import { useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { matchesQuery } from '../../lib/search';
import { BottomSheet } from '../bottom-sheet/bottom-sheet';
import { Button } from '../button/button';
import { Checkbox, Radio } from '../choice/choice';
import { SearchBar } from '../search-bar/search-bar';
import { Text } from '../text/text';
import { FieldTrigger } from '../text-field/field-trigger';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

/** Textos de la hoja (llegan traducidos). */
export interface SelectLabels {
  /** Sin nada elegido ("Elige una categoría"). */
  placeholder?: string;
  search: string;
  clearSearch: string;
  /** Sin resultados para la búsqueda. */
  empty: string;
  close: string;
  /** Confirma la selección múltiple ("Listo"). */
  done: string;
}

interface SelectCommonProps<T extends string> {
  label: string;
  options: readonly SelectOption<T>[];
  labels: SelectLabels;
  /** Muestra la búsqueda; por defecto, con más de 7 opciones. */
  searchable?: boolean;
  helper?: string;
  error?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export type SelectProps<T extends string> = SelectCommonProps<T> &
  (
    | { multiple?: false; value: T | undefined; onChange: (value: T) => void }
    | { multiple: true; value: readonly T[]; onChange: (value: T[]) => void }
  );

const SEARCH_FROM = 8;

/**
 * P10 · Select: campo que abre una hoja (P24, M10) con búsqueda y la lista. Selección simple (Radio:
 * elegir cierra la hoja) o múltiple (Checkbox y "Listo"). La búsqueda no distingue tildes.
 */
export function Select<T extends string>(props: SelectProps<T>) {
  const { label, options, labels, helper, error, disabled, style, testID } = props;
  const searchable = props.searchable ?? options.length >= SEARCH_FROM;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<readonly T[]>([]);

  const selected: readonly T[] = props.multiple
    ? props.value
    : props.value === undefined
      ? []
      : [props.value];
  const display = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label)
    .join(', ');
  const visible = options.filter((option) => matchesQuery(query, option.label, option.description));

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <FieldTrigger
        label={label}
        display={display === '' ? undefined : display}
        placeholder={labels.placeholder}
        helper={helper}
        error={error}
        disabled={disabled}
        expanded={open}
        onPress={() => {
          setDraft(selected);
          setOpen(true);
        }}
        style={style}
        testID={testID}
      />
      <BottomSheet
        visible={open}
        onClose={close}
        closeLabel={labels.close}
        title={label}
        height={searchable ? 'full' : 'auto'}
        {...(props.multiple
          ? {
              footer: (
                <Button
                  label={labels.done}
                  fullWidth
                  onPress={() => {
                    props.onChange([...draft]);
                    close();
                  }}
                />
              ),
            }
          : {})}
      >
        {searchable ? (
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={labels.search}
            clearLabel={labels.clearSearch}
          />
        ) : null}
        <View
          accessibilityRole={props.multiple ? undefined : 'radiogroup'}
          accessibilityLabel={label}
          style={styles.list}
        >
          {visible.length === 0 ? (
            <Text tone="muted" style={styles.empty}>
              {labels.empty}
            </Text>
          ) : null}
          {visible.map((option) =>
            props.multiple ? (
              <Checkbox
                key={option.value}
                label={option.label}
                {...(option.description === undefined ? {} : { description: option.description })}
                checked={draft.includes(option.value)}
                onChange={(checked) => {
                  setDraft((current) =>
                    checked
                      ? [...current, option.value]
                      : current.filter((value) => value !== option.value),
                  );
                }}
              />
            ) : (
              <Radio
                key={option.value}
                label={option.label}
                {...(option.description === undefined ? {} : { description: option.description })}
                selected={props.value === option.value}
                onSelect={() => {
                  props.onChange(option.value);
                  close();
                }}
              />
            ),
          )}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    gap: theme.space[1],
  },
  empty: {
    paddingVertical: theme.space[4],
    textAlign: 'center',
  },
}));
