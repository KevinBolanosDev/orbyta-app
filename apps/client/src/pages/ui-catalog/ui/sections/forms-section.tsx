import Pencil from 'lucide-react-native/icons/pencil';
import Trash from 'lucide-react-native/icons/trash';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useNumberLocale, useTranslation } from '@/shared/i18n';
import {
  AmountText,
  applyAmountKey,
  Avatar,
  Checkbox,
  CURRENCY_DECIMALS,
  DatePicker,
  ListItem,
  MoneyInput,
  NumberPad,
  PullToRefresh,
  RadioGroup,
  SearchBar,
  Select,
  Switch,
  Text,
  TextField,
  useToast,
  type AmountCurrency,
  type DatePickerLabels,
  type DayRange,
  type SelectLabels,
} from '@/shared/ui';

import { CatalogSection, CatalogSubheading } from '../catalog-section';

const CATEGORY_KEYS = [
  'food',
  'transport',
  'market',
  'leisure',
  'health',
  'credit',
  'utilities',
  'education',
] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

// Comercios y montos de ejemplo: son datos, no textos de la interfaz.
interface Movement {
  id: string;
  name: string;
  category: CategoryKey;
  amount: string;
}
const MOVEMENTS: readonly Movement[] = [
  { id: 'm1', name: 'Rappi', category: 'food', amount: '-32000' },
  { id: 'm2', name: 'Éxito', category: 'market', amount: '-184500' },
  { id: 'm3', name: 'Uber', category: 'transport', amount: '-15800' },
  { id: 'm4', name: 'Netflix', category: 'leisure', amount: '-38900' },
];

/** Formularios y listas de F1.6 (§7.1). */
export function FormsSection() {
  const { t } = useTranslation();
  const locale = useNumberLocale();
  const toast = useToast();

  const [note, setNote] = useState('');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<AmountCurrency>('COP');
  const [category, setCategory] = useState<CategoryKey | undefined>(undefined);
  const [categories, setCategories] = useState<CategoryKey[]>([]);
  const [date, setDate] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<DayRange | undefined>(undefined);
  const [reminder, setReminder] = useState<string | undefined>(undefined);
  const [privacy, setPrivacy] = useState(false);
  const [gamification, setGamification] = useState(true);
  const [checks, setChecks] = useState<readonly CategoryKey[]>(['food']);
  const [frequency, setFrequency] = useState<'monthly' | 'weekly'>('monthly');
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const [movements, setMovements] = useState<readonly Movement[]>(MOVEMENTS);
  const [refreshing, setRefreshing] = useState(false);

  const categoryOptions = CATEGORY_KEYS.map((key) => ({
    value: key,
    label: t(`catalog.forms.options.${key}`),
  }));
  const selectLabels: SelectLabels = {
    search: t('common.search'),
    clearSearch: t('common.clearSearch'),
    empty: t('common.noResults'),
    close: t('common.close'),
    done: t('common.done'),
  };
  const dateLabels: DatePickerLabels = {
    placeholder: t('date.placeholder'),
    close: t('common.close'),
    done: t('common.done'),
    today: t('date.today'),
    yesterday: t('date.yesterday'),
    last7Days: t('date.last7Days'),
    monthToDate: t('date.monthToDate'),
    previousMonth: t('date.previousMonth'),
    nextMonth: t('date.nextMonth'),
    time: t('date.time'),
    earlier: t('date.earlier'),
    later: t('date.later'),
  };
  const decimals = CURRENCY_DECIMALS[currency];

  const refresh = () => {
    setRefreshing(true);
    // Simula la red: vuelve la lista completa.
    setTimeout(() => {
      setMovements(MOVEMENTS);
      setRefreshing(false);
      toast.show({ message: t('catalog.forms.refreshed'), tone: 'success' });
    }, 1200);
  };

  return (
    <CatalogSection title={t('catalog.sections.forms')}>
      <CatalogSubheading>{t('catalog.forms.textFields')}</CatalogSubheading>
      <View style={styles.grid}>
        <TextField
          label={t('catalog.forms.note')}
          placeholder={t('catalog.forms.notePlaceholder')}
          helper={t('catalog.forms.noteHelper')}
          value={note}
          onChangeText={setNote}
          maxLength={40}
          showCounter
          style={styles.cell}
        />
        <TextField
          label={t('catalog.forms.merchant')}
          value={merchant}
          onChangeText={setMerchant}
          {...(merchant === '' ? { error: t('catalog.forms.merchantError') } : {})}
          style={styles.cell}
        />
        <TextField
          label={t('catalog.forms.rate')}
          value="12,4"
          suffix="%"
          helper={t('catalog.forms.locked')}
          disabled
          style={styles.cell}
        />
      </View>

      <CatalogSubheading>{t('catalog.forms.money')}</CatalogSubheading>
      <View style={styles.money}>
        <MoneyInput
          label={t('catalog.forms.amount')}
          helper={t('catalog.forms.amountHelper')}
          value={amount}
          onChangeValue={setAmount}
          currency={currency}
          onCurrencyChange={setCurrency}
          currencyLabel={t('catalog.forms.currency')}
          locale={locale}
          placeholder="0"
        />
        <NumberPad
          decimals={decimals}
          locale={locale}
          backspaceLabel={t('common.backspace')}
          decimalLabel={t('common.decimalSeparator')}
          onKey={(key) => {
            setAmount((current) => applyAmountKey(current, key, decimals));
          }}
          onClear={() => {
            setAmount('');
          }}
        />
      </View>

      <CatalogSubheading>{t('catalog.forms.pickers')}</CatalogSubheading>
      <View style={styles.grid}>
        <Select
          label={t('catalog.forms.category')}
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          labels={{ ...selectLabels, placeholder: t('catalog.forms.categoryPlaceholder') }}
          style={styles.cell}
        />
        <Select
          label={t('catalog.forms.categories')}
          multiple
          options={categoryOptions}
          value={categories}
          onChange={setCategories}
          labels={{ ...selectLabels, placeholder: t('catalog.forms.categoriesPlaceholder') }}
          style={styles.cell}
        />
        <DatePicker
          label={t('catalog.forms.date')}
          labels={dateLabels}
          locale={locale}
          value={date}
          onChange={setDate}
          style={styles.cell}
        />
        <DatePicker
          mode="range"
          label={t('catalog.forms.range')}
          labels={dateLabels}
          locale={locale}
          value={range}
          onChange={setRange}
          style={styles.cell}
        />
        <DatePicker
          mode="datetime"
          label={t('catalog.forms.reminder')}
          labels={dateLabels}
          locale={locale}
          value={reminder}
          onChange={setReminder}
          style={styles.cell}
        />
      </View>

      <CatalogSubheading>{t('catalog.forms.toggles')}</CatalogSubheading>
      <View style={styles.grid}>
        <View style={styles.cell}>
          <Switch
            label={t('catalog.forms.privacy')}
            description={t('catalog.forms.privacyHint')}
            value={privacy}
            onValueChange={setPrivacy}
          />
          <Switch
            label={t('catalog.forms.gamification')}
            value={gamification}
            onValueChange={setGamification}
          />
        </View>
        <View style={styles.cell}>
          {(['food', 'transport'] as const).map((key) => (
            <Checkbox
              key={key}
              label={t(`catalog.forms.options.${key}`)}
              checked={checks.includes(key)}
              onChange={(checked) => {
                setChecks((current) =>
                  checked ? [...current, key] : current.filter((item) => item !== key),
                );
              }}
            />
          ))}
        </View>
        <RadioGroup
          accessibilityLabel={t('catalog.forms.frequency')}
          value={frequency}
          onChange={setFrequency}
          options={[
            { value: 'monthly', label: t('catalog.forms.monthly') },
            {
              value: 'weekly',
              label: t('catalog.forms.weekly'),
              description: t('catalog.forms.weeklyHint'),
            },
          ]}
          style={styles.cell}
        />
      </View>

      <CatalogSubheading>{t('catalog.forms.search')}</CatalogSubheading>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSearch={setSearched}
        placeholder={t('catalog.forms.searchPlaceholder')}
        clearLabel={t('common.clearSearch')}
        cancelLabel={t('common.cancel')}
        onCancel={() => undefined}
      />
      {searched === '' ? null : (
        <Text tone="muted">{t('catalog.forms.searched', { query: searched })}</Text>
      )}

      <CatalogSubheading>{t('catalog.forms.list')}</CatalogSubheading>
      <Text tone="muted">{t('catalog.forms.listHint')}</Text>
      <View style={styles.listBox}>
        <PullToRefresh
          refreshing={refreshing}
          onRefresh={refresh}
          refreshLabel={t('common.refresh')}
          contentContainerStyle={styles.list}
          testID="forms-refresh"
        >
          {movements.map((movement) => (
            <ListItem
              key={movement.id}
              title={movement.name}
              subtitle={t(`catalog.forms.options.${movement.category}`)}
              leading={<Avatar name={movement.name} size={40} />}
              trailing={
                <AmountText
                  value={movement.amount}
                  currency="COP"
                  locale={locale}
                  colorBySign
                  variant="numM"
                />
              }
              animateIn
              leadingAction={{
                label: t('catalog.forms.edit'),
                icon: Pencil,
                onAction: () => {
                  toast.show({ message: t('catalog.forms.editing', { name: movement.name }) });
                },
              }}
              trailingAction={{
                label: t('catalog.forms.delete'),
                icon: Trash,
                tone: 'danger',
                removes: true,
                onAction: () => {
                  setMovements((current) => current.filter((item) => item.id !== movement.id));
                  toast.show({
                    message: t('catalog.forms.deleted', { name: movement.name }),
                    tone: 'undo',
                    actionLabel: t('common.undo'),
                    onAction: () => {
                      setMovements((current) =>
                        MOVEMENTS.filter(
                          (item) => item.id === movement.id || current.includes(item),
                        ),
                      );
                    },
                  });
                },
              }}
            />
          ))}
        </PullToRefresh>
      </View>
    </CatalogSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[4],
  },
  cell: {
    flexGrow: 1,
    flexBasis: 260,
    gap: theme.space[2],
  },
  money: {
    width: '100%',
    maxWidth: 420,
    gap: theme.space[4],
  },
  listBox: {
    height: 360,
    overflow: 'hidden',
    borderRadius: theme.radius.l,
  },
  list: {
    gap: theme.space[2],
  },
}));
