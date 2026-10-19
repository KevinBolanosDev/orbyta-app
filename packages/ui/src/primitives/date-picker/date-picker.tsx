import CalendarDays from 'lucide-react-native/icons/calendar-days';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Minus from 'lucide-react-native/icons/minus';
import Plus from 'lucide-react-native/icons/plus';
import { useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  addDaysIso,
  cursorOf,
  formatDay,
  formatDayLong,
  formatRange,
  isInRange,
  joinDateTime,
  lastDays,
  monthGrid,
  monthTitle,
  monthToDate,
  orderRange,
  shiftMonth,
  shiftTime,
  splitDateTime,
  toIsoDay,
  weekdayLabels,
  weekStartOf,
  type DayRange,
  type IsoDay,
  type MonthCursor,
} from '../../lib/calendar';
import { withAlpha } from '../../lib/color';
import type { NumberLocale } from '../../lib/format-number';
import { triggerHaptic } from '../../motion/haptics';
import { BottomSheet } from '../bottom-sheet/bottom-sheet';
import { Button } from '../button/button';
import { Chip } from '../chip/chip';
import { IconButton } from '../icon-button/icon-button';
import { Text } from '../text/text';
import { FieldTrigger } from '../text-field/field-trigger';

/** Textos del selector (llegan traducidos). */
export interface DatePickerLabels {
  placeholder?: string;
  close: string;
  done: string;
  today: string;
  yesterday: string;
  /** Atajos de rango. */
  last7Days: string;
  monthToDate: string;
  previousMonth: string;
  nextMonth: string;
  /** Hora: nombre del control y de sus botones ("Hora", "Antes", "Después"). */
  time: string;
  earlier: string;
  later: string;
}

interface DatePickerCommonProps {
  label: string;
  labels: DatePickerLabels;
  locale?: NumberLocale;
  /** Hoy (`YYYY-MM-DD`); por defecto, el día local. Sirve para pruebas y para la zona del usuario. */
  today?: IsoDay;
  /** Paso de la hora en minutos (5 por defecto). */
  minuteStep?: number;
  helper?: string;
  error?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export type DatePickerProps = DatePickerCommonProps &
  (
    | { mode?: 'date'; value: IsoDay | undefined; onChange: (value: IsoDay) => void }
    | { mode: 'range'; value: DayRange | undefined; onChange: (value: DayRange) => void }
    | { mode: 'datetime'; value: string | undefined; onChange: (value: string) => void }
  );

/** Lo que se edita dentro de la hoja antes de confirmar. */
interface Draft {
  start: IsoDay | undefined;
  end: IsoDay | undefined;
  time: string;
}

/**
 * P11 · DatePicker: campo que abre una hoja (M10) con atajos ("Hoy", "Ayer" o rangos), el calendario
 * del mes y, en `datetime`, la hora. Las fechas son días locales `YYYY-MM-DD` (ADR 0004); la fecha con
 * hora, `YYYY-MM-DDTHH:mm`. Se confirma con "Listo".
 */
export function DatePicker(props: DatePickerProps) {
  const {
    label,
    labels,
    locale = 'es-CO',
    minuteStep = 5,
    helper,
    error,
    disabled,
    style,
    testID,
  } = props;
  const mode = props.mode ?? 'date';
  // Hoy se toma una vez al montar (o llega por props): no cambia mientras el selector está abierto.
  const [localToday] = useState(() => toIsoDay(new Date()));
  const today = props.today ?? localToday;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ start: undefined, end: undefined, time: '09:00' });
  const [cursor, setCursor] = useState<MonthCursor>(() => cursorOf(today));

  const display = displayOf(props, locale);

  const openSheet = () => {
    const initial = draftOf(props);
    setDraft(initial);
    setCursor(cursorOf(initial.start ?? today));
    setOpen(true);
  };

  const pick = (iso: IsoDay) => {
    triggerHaptic('selection');
    setDraft((current) => {
      if (mode !== 'range') return { ...current, start: iso, end: iso };
      // Rango: el primer toque empieza uno nuevo; el segundo lo cierra (en cualquier orden).
      if (current.start === undefined || current.end !== undefined) {
        return { ...current, start: iso, end: undefined };
      }
      const range = orderRange(current.start, iso);
      return { ...current, start: range.start, end: range.end };
    });
  };

  const applyShortcut = (range: DayRange) => {
    setDraft((current) => ({ ...current, start: range.start, end: range.end }));
    setCursor(cursorOf(range.end));
  };

  const confirm = () => {
    if (draft.start === undefined) return;
    if (props.mode === 'range') {
      props.onChange(orderRange(draft.start, draft.end ?? draft.start));
    } else if (props.mode === 'datetime') {
      props.onChange(joinDateTime(draft.start, draft.time));
    } else {
      props.onChange(draft.start);
    }
    setOpen(false);
  };

  const yesterday = addDaysIso(today, -1);
  const shortcuts: { label: string; range: DayRange }[] =
    mode === 'range'
      ? [
          { label: labels.last7Days, range: lastDays(today, 7) },
          { label: labels.monthToDate, range: monthToDate(today) },
        ]
      : [
          { label: labels.today, range: { start: today, end: today } },
          { label: labels.yesterday, range: { start: yesterday, end: yesterday } },
        ];
  const selection: DayRange | undefined =
    draft.start === undefined ? undefined : orderRange(draft.start, draft.end ?? draft.start);

  return (
    <>
      <FieldTrigger
        label={label}
        display={display}
        placeholder={labels.placeholder}
        helper={helper}
        error={error}
        disabled={disabled}
        expanded={open}
        icon={CalendarDays}
        onPress={openSheet}
        style={style}
        testID={testID}
      />
      <BottomSheet
        visible={open}
        onClose={() => {
          setOpen(false);
        }}
        closeLabel={labels.close}
        title={label}
        footer={
          <Button
            label={labels.done}
            fullWidth
            disabled={draft.start === undefined}
            onPress={confirm}
          />
        }
      >
        <View style={styles.shortcuts}>
          {shortcuts.map((shortcut) => (
            <Chip
              key={shortcut.label}
              label={shortcut.label}
              selected={
                selection?.start === shortcut.range.start && selection.end === shortcut.range.end
              }
              onPress={() => {
                applyShortcut(shortcut.range);
              }}
            />
          ))}
        </View>
        <MonthView
          cursor={cursor}
          onCursorChange={setCursor}
          selection={selection}
          rangeMode={mode === 'range'}
          today={today}
          locale={locale}
          labels={labels}
          onPick={pick}
        />
        {mode === 'datetime' ? (
          <TimeStepper
            value={draft.time}
            step={minuteStep}
            labels={labels}
            onChange={(time) => {
              setDraft((current) => ({ ...current, time }));
            }}
          />
        ) : null}
      </BottomSheet>
    </>
  );
}

function displayOf(props: DatePickerProps, locale: NumberLocale): string | undefined {
  if (props.value === undefined) return undefined;
  if (props.mode === 'range') return formatRange(props.value, locale);
  if (props.mode === 'datetime') {
    const { day, time } = splitDateTime(props.value);
    return `${formatDay(day, locale)}, ${time}`;
  }
  return formatDay(props.value, locale);
}

function draftOf(props: DatePickerProps): Draft {
  if (props.value === undefined) return { start: undefined, end: undefined, time: '09:00' };
  if (props.mode === 'range') return { ...props.value, time: '09:00' };
  if (props.mode === 'datetime') {
    const { day, time } = splitDateTime(props.value);
    return { start: day, end: day, time };
  }
  return { start: props.value, end: props.value, time: '09:00' };
}

interface MonthViewProps {
  cursor: MonthCursor;
  onCursorChange: (cursor: MonthCursor) => void;
  selection: DayRange | undefined;
  rangeMode: boolean;
  today: IsoDay;
  locale: NumberLocale;
  labels: DatePickerLabels;
  onPick: (iso: IsoDay) => void;
}

/** Mes con su título, flechas y la cuadrícula de 6 semanas. */
function MonthView({
  cursor,
  onCursorChange,
  selection,
  rangeMode,
  today,
  locale,
  labels,
  onPick,
}: MonthViewProps) {
  const { theme } = useUnistyles();
  const weeks = monthGrid(cursor, weekStartOf(locale));
  const names = weekdayLabels(locale);
  const rangeFill = withAlpha(theme.colors.primary, 0.18);

  return (
    <View style={styles.month}>
      <View style={styles.monthHeader}>
        <IconButton
          icon={ChevronLeft}
          variant="plain"
          accessibilityLabel={labels.previousMonth}
          onPress={() => {
            onCursorChange(shiftMonth(cursor, -1));
          }}
        />
        <Text variant="titleS" accessibilityRole="header" accessibilityLiveRegion="polite">
          {monthTitle(cursor, locale)}
        </Text>
        <IconButton
          icon={ChevronRight}
          variant="plain"
          accessibilityLabel={labels.nextMonth}
          onPress={() => {
            onCursorChange(shiftMonth(cursor, 1));
          }}
        />
      </View>
      <View style={styles.week} importantForAccessibility="no-hide-descendants">
        {/* Las iniciales se repiten ("S" en inglés): la clave es el día de la primera semana. */}
        {(weeks[0] ?? []).map((day, i) => (
          <Text key={day.iso} variant="caption" tone="muted" style={styles.weekday}>
            {names[i]}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0]?.iso} style={styles.week}>
          {week.map((day) => {
            const selected = selection !== undefined && isInRange(day.iso, selection);
            const edge =
              selection !== undefined && (day.iso === selection.start || day.iso === selection.end);
            const middle = rangeMode && selected && !edge;
            return (
              <Pressable
                key={day.iso}
                accessibilityRole="button"
                accessibilityLabel={formatDayLong(day.iso, locale)}
                accessibilityState={{ selected: edge || (selected && !rangeMode) }}
                onPress={() => {
                  onPick(day.iso);
                }}
                style={styles.dayCell(middle ? rangeFill : undefined)}
              >
                <View style={styles.day(edge, day.iso === today)}>
                  <Text
                    variant="label"
                    tone={edge ? 'onPrimary' : day.inMonth ? 'default' : 'subtle'}
                  >
                    {day.day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** Hora con "antes" y "después" (paso de `step` minutos); para el lector de pantalla es ajustable. */
function TimeStepper({
  value,
  step,
  labels,
  onChange,
}: {
  value: string;
  step: number;
  labels: DatePickerLabels;
  onChange: (time: string) => void;
}) {
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={labels.time}
      accessibilityValue={{ text: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        onChange(shiftTime(value, event.nativeEvent.actionName === 'increment' ? step : -step));
      }}
      style={styles.time}
    >
      <Text variant="label" tone="muted" style={styles.timeLabel}>
        {labels.time}
      </Text>
      <IconButton
        icon={Minus}
        accessibilityLabel={labels.earlier}
        onPress={() => {
          onChange(shiftTime(value, -step));
        }}
      />
      <Text variant="numL">{value}</Text>
      <IconButton
        icon={Plus}
        accessibilityLabel={labels.later}
        onPress={() => {
          onChange(shiftTime(value, step));
        }}
      />
    </View>
  );
}

const DAY = 40;

const styles = StyleSheet.create((theme) => ({
  shortcuts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[2],
  },
  month: {
    gap: theme.space[1],
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
  },
  // Los días entre los extremos de un rango llevan una banda de color.
  dayCell: (fill: string | undefined) => ({
    flex: 1,
    minHeight: theme.layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fill,
  }),
  day: (edge: boolean, today: boolean) => ({
    width: DAY,
    height: DAY,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: today && !edge ? 1 : 0,
    borderColor: theme.colors.primary,
    backgroundColor: edge ? theme.colors.primary : 'transparent',
  }),
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
  },
  timeLabel: {
    flex: 1,
  },
}));
