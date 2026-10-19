import type { ComponentRef, Ref } from 'react';
import type { StyleProp, TextInput, ViewStyle } from 'react-native';

import { formatAmountInput, parseAmountInput } from '../../lib/amount-input';
import {
  CURRENCY_DECIMALS,
  CURRENCY_PREFIX,
  type AmountCurrency,
  type NumberLocale,
} from '../../lib/format-number';
import { SegmentedControl } from '../segmented-control/segmented-control';
import type { FieldSize } from '../text-field/field-frame';
import { TextField } from '../text-field/text-field';

export interface MoneyInputProps {
  label: string;
  /** Valor canónico (`"1234567"`, `"12.5"`; `""` vacío), igual al que recibe AmountText. */
  value: string;
  onChangeValue: (value: string) => void;
  currency: AmountCurrency;
  /** Con esto aparece el selector de moneda junto a la etiqueta. */
  onCurrencyChange?: (currency: AmountCurrency) => void;
  currencies?: readonly AmountCurrency[];
  /** Nombre accesible del selector de moneda ("Moneda"). */
  currencyLabel?: string;
  locale?: NumberLocale;
  /** `l` (por defecto) para el registro rápido; `m` dentro de formularios. */
  size?: FieldSize;
  helper?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  /**
   * La pantalla muestra su NumberPad (P09): el campo no abre el teclado del sistema y se escribe con
   * `applyAmountKey`.
   */
  withNumberPad?: boolean;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

/**
 * P08 · MoneyInput: monto con el símbolo de la moneda y formato en vivo del locale (`1.234.567` en
 * es-CO). Trabaja sobre texto decimal (sin `number`), así no pierde dígitos. COP no admite decimales;
 * USD admite 2. Al cambiar a una moneda con menos decimales, recorta los que sobran.
 */
export function MoneyInput({
  label,
  value,
  onChangeValue,
  currency,
  onCurrencyChange,
  currencies = ['COP', 'USD'],
  currencyLabel,
  locale = 'es-CO',
  size = 'l',
  helper,
  error,
  placeholder,
  disabled,
  withNumberPad = false,
  autoFocus,
  style,
  testID,
  ref,
}: MoneyInputProps) {
  const decimals = CURRENCY_DECIMALS[currency];

  const selector = onCurrencyChange ? (
    <SegmentedControl
      accessibilityLabel={currencyLabel ?? label}
      value={currency}
      options={currencies.map((code) => ({ value: code, label: code }))}
      onChange={(next) => {
        onCurrencyChange(next);
        // Reinterpreta lo escrito con los decimales de la moneda nueva.
        onChangeValue(
          parseAmountInput(formatAmountInput(value, locale), locale, CURRENCY_DECIMALS[next]),
        );
      }}
    />
  ) : undefined;

  return (
    <TextField
      ref={ref}
      label={label}
      labelAccessory={selector}
      helper={helper}
      error={error}
      prefix={CURRENCY_PREFIX[currency]}
      size={size}
      disabled={disabled}
      value={formatAmountInput(value, locale)}
      onChangeText={(text) => {
        onChangeValue(parseAmountInput(text, locale, decimals));
      }}
      placeholder={placeholder}
      inputMode={decimals > 0 ? 'decimal' : 'numeric'}
      showSoftInputOnFocus={!withNumberPad}
      autoFocus={autoFocus}
      style={style}
      testID={testID}
    />
  );
}
