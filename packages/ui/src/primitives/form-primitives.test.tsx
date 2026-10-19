import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import Pencil from 'lucide-react-native/icons/pencil';
import Trash from 'lucide-react-native/icons/trash';
import { useState, type ReactNode } from 'react';
import { Text as NativeText } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { applyAmountKey, type AmountKey } from '../lib/amount-input';
import type { DayRange } from '../lib/calendar';
import type { AmountCurrency } from '../lib/format-number';
import { AccessibilityPreferencesProvider } from '../motion/accessibility-preferences';

import { Checkbox, RadioGroup } from './choice/choice';
import { DatePicker, type DatePickerLabels } from './date-picker/date-picker';
import { ListItem } from './list-item/list-item';
import { MoneyInput } from './money-input/money-input';
import { NumberPad } from './number-pad/number-pad';
import { PullToRefresh } from './pull-to-refresh/pull-to-refresh';
import { SearchBar } from './search-bar/search-bar';
import { Select, type SelectLabels } from './select/select';
import { Switch } from './switch/switch';
import { TextField } from './text-field/text-field';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

// En nativo los gestos (deslizar en ListItem, tirar en PullToRefresh) necesitan GestureHandlerRootView.
function Motion({ children, reduced = false }: { children: ReactNode; reduced?: boolean }) {
  return (
    <GestureHandlerRootView>
      <AccessibilityPreferencesProvider reduceMotion={reduced}>
        {children}
      </AccessibilityPreferencesProvider>
    </GestureHandlerRootView>
  );
}

const advance = async (ms: number) => {
  await act(() => {
    jest.advanceTimersByTime(ms);
  });
};

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('TextField (P07)', () => {
  it('shows label, helper, counter and focus, and reads the error as a hint', async () => {
    const onChangeText = jest.fn();
    const { rerender } = await render(
      <TextField
        label="Nota"
        helper="Opcional"
        maxLength={20}
        showCounter
        prefix="#"
        suffix={<NativeText>fin</NativeText>}
        onChangeText={onChangeText}
      />,
    );
    const input = screen.getByLabelText('Nota');
    expect(screen.getByText('Opcional')).toBeOnTheScreen();
    expect(screen.getByText('0/20')).toBeOnTheScreen();
    await fireEvent(input, 'focus');
    await fireEvent.changeText(input, 'Almuerzo');
    await fireEvent(input, 'blur');
    expect(onChangeText).toHaveBeenCalledWith('Almuerzo');
    expect(screen.getByText('8/20')).toBeOnTheScreen();

    await rerender(<TextField label="Nota" error="Es obligatoria" value="" disabled size="l" />);
    expect(screen.getByLabelText('Nota')).toHaveProp('accessibilityHint', 'Es obligatoria');
    expect(screen.getByLabelText('Nota')).toHaveProp('editable', false);
    expect(screen.getByText('Es obligatoria')).toBeOnTheScreen();
  });
});

describe('MoneyInput (P08) and NumberPad (P09)', () => {
  function Amount({ initial = '' }: { initial?: string }) {
    const [value, setValue] = useState(initial);
    const [currency, setCurrency] = useState<AmountCurrency>('USD');
    return (
      <>
        <MoneyInput
          label="Monto"
          value={value}
          onChangeValue={setValue}
          currency={currency}
          onCurrencyChange={setCurrency}
          currencyLabel="Moneda"
          withNumberPad
        />
        <NumberPad
          decimals={currency === 'USD' ? 2 : 0}
          backspaceLabel="Borrar"
          onKey={(key: AmountKey) => {
            setValue((current) => applyAmountKey(current, key, currency === 'USD' ? 2 : 0));
          }}
          onClear={() => {
            setValue('');
          }}
        />
        <NativeText testID="value">{value}</NativeText>
      </>
    );
  }

  it('formats as it is typed and trims decimals when switching to COP', async () => {
    await render(
      <Motion>
        <Amount />
      </Motion>,
    );
    await fireEvent.changeText(screen.getByLabelText('Monto'), '1234,567');
    expect(screen.getByTestId('value')).toHaveTextContent('1234.56');
    expect(screen.getByLabelText('Monto')).toHaveProp('value', '1.234,56');
    await fireEvent.press(screen.getByRole('radio', { name: 'COP' }));
    expect(screen.getByTestId('value')).toHaveTextContent('1234');
  });

  it('types with the number pad and clears with a long press', async () => {
    await render(
      <Motion>
        <Amount />
      </Motion>,
    );
    for (const key of ['1', '2', ',', '5']) {
      await fireEvent.press(screen.getByRole('button', { name: key }));
    }
    expect(screen.getByTestId('value')).toHaveTextContent('12.5');
    await fireEvent.press(screen.getByRole('button', { name: 'Borrar' }));
    expect(screen.getByTestId('value')).toHaveTextContent('12.');
    await fireEvent(screen.getByRole('button', { name: 'Borrar' }), 'longPress');
    expect(screen.getByTestId('value')).toHaveTextContent('');
    await fireEvent.press(screen.getByRole('radio', { name: 'COP' }));
    expect(screen.getByRole('button', { name: '000' })).toBeOnTheScreen();
  });
});

describe('Switch (P14), Checkbox and Radio (P15)', () => {
  it('toggles from the whole row', async () => {
    const onValueChange = jest.fn();
    const onChange = jest.fn();
    await render(
      <Motion>
        <Switch
          label="Modo privado"
          description="Oculta montos"
          value={false}
          onValueChange={onValueChange}
        />
        <Checkbox label="Comida" checked="mixed" onChange={onChange} />
        <Checkbox label="Ocio" checked onChange={onChange} disabled />
      </Motion>,
    );
    await fireEvent.press(screen.getByRole('switch', { name: 'Modo privado' }));
    expect(onValueChange).toHaveBeenCalledWith(true);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Comida' }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('checkbox', { name: 'Ocio' })).toBeDisabled();
  });

  it('selects one option in a radio group', async () => {
    const onChange = jest.fn();
    await render(
      <Motion reduced>
        <RadioGroup
          accessibilityLabel="Período"
          value="month"
          onChange={onChange}
          options={[
            { value: 'month', label: 'Mensual' },
            { value: 'week', label: 'Semanal', description: 'Se reinicia el lunes' },
          ]}
        />
      </Motion>,
    );
    const group = screen.getByLabelText('Período');
    await fireEvent.press(within(group).getByRole('radio', { name: 'Mensual' }));
    expect(onChange).not.toHaveBeenCalled();
    await fireEvent.press(within(group).getByRole('radio', { name: 'Semanal' }));
    expect(onChange).toHaveBeenCalledWith('week');
  });
});

describe('SearchBar (P33)', () => {
  function Search({ onSearch, onCancel }: { onSearch: jest.Mock; onCancel: jest.Mock }) {
    const [value, setValue] = useState('');
    return (
      <SearchBar
        value={value}
        onChangeText={setValue}
        onSearch={onSearch}
        placeholder="Buscar comercio"
        clearLabel="Borrar búsqueda"
        cancelLabel="Cancelar"
        onCancel={onCancel}
      />
    );
  }

  it('debounces the search, clears and cancels', async () => {
    const onSearch = jest.fn();
    const onCancel = jest.fn();
    await render(<Search onSearch={onSearch} onCancel={onCancel} />);
    const input = screen.getByLabelText('Buscar comercio');
    onSearch.mockClear();
    await fireEvent.changeText(input, 'ra');
    await fireEvent.changeText(input, 'rap');
    await advance(200);
    expect(onSearch).not.toHaveBeenCalled();
    await advance(60);
    expect(onSearch).toHaveBeenCalledWith('rap');

    await fireEvent(input, 'submitEditing');
    expect(onSearch).toHaveBeenLastCalledWith('rap');
    await fireEvent.press(screen.getByRole('button', { name: 'Borrar búsqueda' }));
    expect(onSearch).toHaveBeenLastCalledWith('');

    await fireEvent(input, 'focus');
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    await fireEvent(input, 'blur');
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
  });
});

const selectLabels: SelectLabels = {
  placeholder: 'Elige una categoría',
  search: 'Buscar',
  clearSearch: 'Borrar búsqueda',
  empty: 'Sin resultados',
  close: 'Cerrar',
  done: 'Listo',
};

const CATEGORIES = [
  { value: 'food', label: 'Comida' },
  { value: 'transport', label: 'Transporte' },
  { value: 'credit', label: 'Crédito', description: 'Cuotas y abonos' },
] as const;

describe('Select (P10)', () => {
  it('picks one option and closes', async () => {
    const onChange = jest.fn();
    await render(
      <Motion reduced>
        <Select
          label="Categoría"
          options={CATEGORIES}
          value={undefined}
          onChange={onChange}
          labels={selectLabels}
        />
      </Motion>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Categoría, Elige una categoría' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Transporte' }));
    expect(onChange).toHaveBeenCalledWith('transport');
  });

  it('searches without accents and confirms several options', async () => {
    function Many() {
      const [value, setValue] = useState<string[]>(['food']);
      return (
        <Select
          label="Categorías"
          multiple
          searchable
          options={CATEGORIES}
          value={value}
          onChange={setValue}
          labels={selectLabels}
        />
      );
    }
    await render(
      <Motion reduced>
        <Many />
      </Motion>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Categorías, Comida' }));
    await fireEvent.changeText(screen.getByLabelText('Buscar'), 'credito');
    expect(screen.queryByRole('checkbox', { name: 'Comida' })).toBeNull();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Crédito' }));
    await fireEvent.changeText(screen.getByLabelText('Buscar'), 'zzz');
    expect(screen.getByText('Sin resultados')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Buscar'), '');
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Comida' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Listo' }));
    await advance(200);
    expect(screen.getByRole('button', { name: 'Categorías, Crédito' })).toBeOnTheScreen();
  });
});

const dateLabels: DatePickerLabels = {
  placeholder: 'Elige una fecha',
  close: 'Cerrar',
  done: 'Listo',
  today: 'Hoy',
  yesterday: 'Ayer',
  last7Days: 'Últimos 7 días',
  monthToDate: 'Este mes',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  time: 'Hora',
  earlier: 'Antes',
  later: 'Después',
};

describe('DatePicker (P11)', () => {
  it('picks a day with the shortcut and the calendar', async () => {
    const onChange = jest.fn();
    await render(
      <Motion reduced>
        <DatePicker
          label="Fecha"
          labels={dateLabels}
          today="2026-10-19"
          value={undefined}
          onChange={onChange}
        />
      </Motion>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Fecha, Elige una fecha' }));
    expect(screen.getByRole('header', { name: 'Octubre 2026' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Listo' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Ayer' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Listo' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-18');

    await fireEvent.press(screen.getByRole('button', { name: 'Fecha, Elige una fecha' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByRole('header', { name: 'Noviembre 2026' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '3 de noviembre de 2026' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Mes anterior' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Listo' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-11-03');
  });

  it('builds a range in any order and offers range shortcuts', async () => {
    function Range() {
      const [value, setValue] = useState<DayRange | undefined>(undefined);
      return (
        <DatePicker
          mode="range"
          label="Período"
          labels={dateLabels}
          today="2026-10-19"
          value={value}
          onChange={setValue}
        />
      );
    }
    await render(
      <Motion reduced>
        <Range />
      </Motion>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Período, Elige una fecha' }));
    await fireEvent.press(screen.getByRole('button', { name: '15 de octubre de 2026' }));
    await fireEvent.press(screen.getByRole('button', { name: '5 de octubre de 2026' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Listo' }));
    await advance(200);
    expect(
      screen.getByRole('button', { name: 'Período, 5 oct 2026 – 15 oct 2026' }),
    ).toBeOnTheScreen();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Período, 5 oct 2026 – 15 oct 2026' }),
    );
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Últimos 7 días' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Listo' }));
    await advance(200);
    expect(
      screen.getByRole('button', { name: 'Período, 13 oct 2026 – 19 oct 2026' }),
    ).toBeOnTheScreen();
  });

  it('adjusts the time in date-time mode', async () => {
    const onChange = jest.fn();
    await render(
      <Motion reduced>
        <DatePicker
          mode="datetime"
          label="Recordatorio"
          labels={dateLabels}
          locale="en-US"
          today="2026-10-19"
          value="2026-10-19T23:55"
          onChange={onChange}
        />
      </Motion>,
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Recordatorio, Oct 19, 2026, 23:55' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Después' }));
    const time = screen.getByRole('adjustable', { name: 'Hora' });
    expect(time).toHaveAccessibilityValue({ text: '00:00' });
    await fireEvent(time, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    await fireEvent.press(screen.getByRole('button', { name: 'Antes' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Listo' }));
    expect(onChange).toHaveBeenCalledWith('2026-10-19T23:50');
  });
});

describe('ListItem (P26)', () => {
  it('presses and runs swipe actions from the screen reader', async () => {
    const onPress = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    await render(
      <Motion>
        <ListItem
          title="Rappi"
          subtitle="Comida · Hoy"
          trailing="$ 32.000"
          onPress={onPress}
          animateIn
          leadingAction={{ label: 'Editar', icon: Pencil, onAction: onEdit }}
          trailingAction={{
            label: 'Eliminar',
            icon: Trash,
            tone: 'danger',
            removes: true,
            onAction: onDelete,
          }}
        />
        <ListItem title="Sin acciones" leading={<NativeText>•</NativeText>} />
      </Motion>,
    );
    const row = screen.getByRole('button', { name: 'Rappi, Comida · Hoy' });
    await fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
    await fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'Editar' } });
    expect(onEdit).toHaveBeenCalledTimes(1);
    await fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'Eliminar' } });
    expect(onDelete).not.toHaveBeenCalled();
    await advance(350);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Sin acciones')).toBeOnTheScreen();
  });
});

describe('PullToRefresh (P38)', () => {
  it('shows its content and refreshes from the screen reader action', async () => {
    const onRefresh = jest.fn();
    const { rerender } = await render(
      <Motion>
        <PullToRefresh
          refreshing={false}
          onRefresh={onRefresh}
          refreshLabel="Actualizar"
          testID="ptr"
        >
          <NativeText>Movimientos</NativeText>
        </PullToRefresh>
      </Motion>,
    );
    expect(screen.getByText('Movimientos')).toBeOnTheScreen();
    const root = screen.getByTestId('ptr');
    await fireEvent(root, 'accessibilityAction', { nativeEvent: { actionName: 'refresh' } });
    expect(onRefresh).toHaveBeenCalledTimes(1);

    await rerender(
      <Motion>
        <PullToRefresh refreshing onRefresh={onRefresh} refreshLabel="Actualizar" testID="ptr">
          <NativeText>Movimientos</NativeText>
        </PullToRefresh>
      </Motion>,
    );
    await fireEvent(screen.getByTestId('ptr'), 'accessibilityAction', {
      nativeEvent: { actionName: 'refresh' },
    });
    expect(onRefresh).toHaveBeenCalledTimes(1);
    await advance(1000);
  });
});
