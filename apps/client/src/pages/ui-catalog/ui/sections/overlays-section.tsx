import Plus from 'lucide-react-native/icons/plus';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';
import {
  BottomSheet,
  Button,
  Chip,
  Dialog,
  Fab,
  OfflineBanner,
  ProgressBar,
  ProgressRing,
  SegmentedControl,
  Stepper,
  SyncBadge,
  Tabs,
  Text,
  useToast,
  type SheetHeight,
} from '@/shared/ui';

import { CatalogSection, CatalogSubheading } from '../catalog-section';

type Period = 'week' | 'month' | 'year';
type Section = 'subscriptions' | 'services' | 'loans';

const PERIODS: readonly Period[] = ['week', 'month', 'year'];
const SECTIONS: readonly Section[] = ['subscriptions', 'services', 'loans'];
const SHEET_HEIGHTS: readonly SheetHeight[] = ['auto', 'half', 'full'];
const SHEET_LABEL = { auto: 'sheetAuto', half: 'sheetHalf', full: 'sheetFull' } as const;

/** Superposiciones, progreso y navegación interna de F1.5 (§7.1). */
export function OverlaysSection() {
  const { t } = useTranslation();
  const toast = useToast();
  const [shuffled, setShuffled] = useState(false);
  const [period, setPeriod] = useState<Period>('month');
  const [section, setSection] = useState<Section>('subscriptions');
  const [step, setStep] = useState(0);
  const [fabOpen, setFabOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Se conserva al cerrar, para que la hoja no cambie de alto mientras sale.
  const [sheetHeight, setSheetHeight] = useState<SheetHeight>('auto');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [offline, setOffline] = useState(false);

  // Presupuestos de ejemplo: sano, al límite y excedido (y otros valores al cambiarlos).
  const budgets = [
    { name: t('catalog.components.food'), value: shuffled ? 0.62 : 0.45 },
    { name: t('catalog.components.transport'), value: shuffled ? 0.97 : 0.86 },
    { name: t('catalog.overlays.subscriptions'), value: shuffled ? 0.3 : 1.12 },
  ];
  const steps = [
    t('catalog.overlays.stepType'),
    t('catalog.overlays.stepDetails'),
    t('catalog.overlays.stepConfirm'),
  ];
  const habitsDone = shuffled ? 3 : 2;

  return (
    <CatalogSection title={t('catalog.sections.overlays')}>
      <CatalogSubheading>{t('catalog.overlays.progress')}</CatalogSubheading>
      <View style={styles.row}>
        <View style={styles.bars}>
          {budgets.map((budget) => {
            const percent = Math.round(budget.value * 100);
            const used = t('catalog.overlays.used', { percent });
            return (
              <View key={budget.name} style={styles.bar}>
                <View style={styles.barLabels}>
                  <Text variant="label">{budget.name}</Text>
                  <Text variant="caption" tone="muted">
                    {used}
                  </Text>
                </View>
                <ProgressBar
                  value={budget.value}
                  tone="auto"
                  accessibilityLabel={t('catalog.overlays.budget', { name: budget.name })}
                  valueText={used}
                />
              </View>
            );
          })}
        </View>
        <ProgressRing
          value={habitsDone / 3}
          tone={habitsDone === 3 ? 'healthy' : 'primary'}
          accessibilityLabel={t('catalog.overlays.habitsToday')}
          valueText={`${habitsDone}/3`}
        >
          <Text variant="numM">{`${habitsDone}/3`}</Text>
        </ProgressRing>
      </View>
      <Button
        label={t('catalog.overlays.shuffle')}
        variant="secondary"
        size="s"
        onPress={() => {
          setShuffled((value) => !value);
        }}
      />

      <CatalogSubheading>{t('catalog.overlays.navigation')}</CatalogSubheading>
      <SegmentedControl
        accessibilityLabel={t('catalog.overlays.period')}
        value={period}
        onChange={setPeriod}
        options={PERIODS.map((value) => ({ value, label: t(`catalog.overlays.${value}`) }))}
      />
      <Tabs
        accessibilityLabel={t('catalog.overlays.sections')}
        value={section}
        onChange={setSection}
        tabs={SECTIONS.map((value) => ({
          value,
          label: t(`catalog.overlays.${value}`),
          ...(value === 'subscriptions' ? { count: 4 } : {}),
        }))}
      />
      <Text tone="muted">
        {t('catalog.overlays.tabContent', { tab: t(`catalog.overlays.${section}`) })}
      </Text>

      <CatalogSubheading>{t('catalog.overlays.stepper')}</CatalogSubheading>
      <Stepper
        steps={steps}
        current={step}
        accessibilityLabel={t('common.stepOf', { current: step + 1, total: steps.length })}
      />
      <View style={styles.row}>
        <Button
          label={t('catalog.overlays.back')}
          variant="secondary"
          size="s"
          disabled={step === 0}
          onPress={() => {
            setStep((value) => value - 1);
          }}
        />
        <Button
          label={t('catalog.overlays.next')}
          size="s"
          disabled={step === steps.length - 1}
          onPress={() => {
            setStep((value) => value + 1);
          }}
        />
      </View>

      <CatalogSubheading>{t('catalog.overlays.fab')}</CatalogSubheading>
      <View style={styles.row}>
        <Fab
          icon={Plus}
          accessibilityLabel={t('catalog.overlays.newExpense')}
          expanded={fabOpen}
          onPress={() => {
            setFabOpen((value) => !value);
          }}
        />
        <Text tone="muted" style={styles.hint}>
          {t('catalog.overlays.fabHint')}
        </Text>
      </View>

      <CatalogSubheading>{t('catalog.overlays.toasts')}</CatalogSubheading>
      <View style={styles.row}>
        <Button
          label={t('catalog.overlays.info')}
          variant="secondary"
          size="s"
          onPress={() => {
            toast.show({ message: t('catalog.overlays.infoMessage') });
          }}
        />
        <Button
          label={t('catalog.overlays.success')}
          variant="secondary"
          size="s"
          onPress={() => {
            toast.show({ message: t('catalog.overlays.successMessage'), tone: 'success' });
          }}
        />
        <Button
          label={t('catalog.overlays.error')}
          variant="secondary"
          size="s"
          onPress={() => {
            toast.show({ message: t('catalog.overlays.errorMessage'), tone: 'error' });
          }}
        />
        <Button
          label={t('common.undo')}
          variant="secondary"
          size="s"
          onPress={() => {
            toast.show({
              message: t('catalog.overlays.undoMessage'),
              tone: 'undo',
              actionLabel: t('common.undo'),
              onAction: () => {
                toast.show({ message: t('catalog.overlays.restored'), tone: 'success' });
              },
            });
          }}
        />
      </View>

      <CatalogSubheading>{t('catalog.overlays.sheets')}</CatalogSubheading>
      <View style={styles.row}>
        {SHEET_HEIGHTS.map((height) => (
          <Button
            key={height}
            label={t(`catalog.overlays.${SHEET_LABEL[height]}`)}
            variant="secondary"
            size="s"
            onPress={() => {
              setSheetHeight(height);
              setSheetOpen(true);
            }}
          />
        ))}
        <Button
          label={t('catalog.overlays.dialog')}
          variant="danger"
          size="s"
          onPress={() => {
            setDialogOpen(true);
          }}
        />
      </View>
      <BottomSheet
        visible={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
        }}
        closeLabel={t('common.close')}
        title={t('catalog.overlays.sheetTitle')}
        height={sheetHeight}
        footer={
          <Button
            label={t('catalog.overlays.apply')}
            fullWidth
            onPress={() => {
              setSheetOpen(false);
            }}
          />
        }
      >
        <Text tone="muted">{t('catalog.overlays.sheetBody')}</Text>
        <SegmentedControl
          accessibilityLabel={t('catalog.overlays.period')}
          value={period}
          onChange={setPeriod}
          fullWidth
          options={PERIODS.map((value) => ({ value, label: t(`catalog.overlays.${value}`) }))}
        />
        <View style={styles.row}>
          <Chip label={t('catalog.components.food')} selected />
          <Chip label={t('catalog.components.transport')} />
          <Chip label={t('catalog.components.income')} />
        </View>
      </BottomSheet>
      <Dialog
        visible={dialogOpen}
        title={t('catalog.overlays.dialogTitle')}
        message={t('catalog.overlays.dialogMessage')}
        confirmLabel={t('catalog.overlays.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        onCancel={() => {
          setDialogOpen(false);
        }}
        onConfirm={() => {
          setDialogOpen(false);
          toast.show({
            message: t('catalog.overlays.undoMessage'),
            tone: 'undo',
            actionLabel: t('common.undo'),
            onAction: () => {
              toast.show({ message: t('catalog.overlays.restored'), tone: 'success' });
            },
          });
        }}
      />

      <CatalogSubheading>{t('catalog.overlays.sync')}</CatalogSubheading>
      <View style={styles.row}>
        <SyncBadge status="synced" label={t('sync.synced')} />
        <SyncBadge status="pending" label={t('sync.pending', { count: 3 })} />
        <SyncBadge status="syncing" label={t('sync.syncing')} />
        <SyncBadge status="error" label={t('sync.error')} />
      </View>
      <Button
        label={t('catalog.overlays.offline')}
        variant="secondary"
        size="s"
        onPress={() => {
          setOffline((value) => !value);
        }}
      />
      <OfflineBanner
        visible={offline}
        message={t('sync.offline')}
        actionLabel={t('common.retry')}
        onAction={() => {
          setOffline(false);
        }}
      />
    </CatalogSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.space[3],
  },
  bars: {
    flexGrow: 1,
    flexBasis: 240,
    gap: theme.space[4],
  },
  bar: {
    gap: theme.space[2],
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hint: {
    flex: 1,
  },
}));
