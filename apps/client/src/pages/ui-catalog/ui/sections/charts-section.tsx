import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useNumberLocale, useTranslation } from '@/shared/i18n';
import {
  addDaysIso,
  AmountText,
  AreaChart,
  BarChart,
  CandleChart,
  Card,
  DonutChart,
  formatDay,
  HeatmapCalendar,
  monthShort,
  shiftMonth,
  Sparkline,
  StatTile,
  Text,
  toIsoDay,
  trendOf,
} from '@/shared/ui';

import { candles, habitDays, walk } from '../../lib/sample-series';
import { CatalogSection, CatalogSubheading } from '../catalog-section';

type Range = 'week' | 'month' | 'quarter' | 'year' | 'all';
const RANGES: readonly Range[] = ['week', 'month', 'quarter', 'year', 'all'];
/** Puntos por rango: diarios hasta 3 meses, semanales en el año y en "Todo". */
const RANGE_POINTS: Record<Range, { count: number; step: number }> = {
  week: { count: 7, step: 1 },
  month: { count: 30, step: 1 },
  quarter: { count: 90, step: 1 },
  year: { count: 52, step: 7 },
  all: { count: 104, step: 7 },
};

const CATEGORY_KEYS = ['food', 'transport', 'market', 'leisure', 'health'] as const;
const SPEND = [1_850_000, 2_240_000, 1_960_000, 2_410_000, 2_090_000, 2_140_000];
const SHARES = [42, 18, 16, 14, 10];

/** Gráficos de F1.7 (§7.2) con datos de ejemplo repetibles. */
export function ChartsSection() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const locale = useNumberLocale();
  const [range, setRange] = useState<Range>('quarter');
  const [slice, setSlice] = useState<number | null>(null);
  const [today] = useState(() => toIsoDay(new Date()));

  const millions = (value: number) =>
    t('catalog.charts.millions', {
      value: (value / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 }),
    });

  // Patrimonio: una caminata hacia arriba; cada rango toma sus últimos puntos.
  const { count, step } = RANGE_POINTS[range];
  const series = walk(count, 120_000_000, 150_000 * step, 900_000 * Math.sqrt(step), count);
  const area = series.map((value, i) => ({
    label: formatDay(addDaysIso(today, -(count - 1 - i) * step), locale),
    value,
  }));
  const first = series[0] ?? 0;
  const last = series.at(-1) ?? 0;

  const month = walk(30, 2_000_000, 8_000, 60_000, 7);
  const netWorth = walk(30, 128_000_000, 210_000, 700_000, 11);
  const habits = walk(30, 3, 0, 1, 3).map((v) => Math.max(0, Math.min(5, v)));

  const cursor = { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 };
  const bars = SPEND.map((value, i) => ({
    label: monthShort(shiftMonth(cursor, i - (SPEND.length - 1)), locale),
    value,
  }));
  const donut = CATEGORY_KEYS.map((key, i) => ({
    label: t(`catalog.forms.options.${key}`),
    value: SHARES[i] ?? 0,
  }));
  const start = addDaysIso(today, -119);
  const days = Array.from({ length: 120 }, (_, i) => addDaysIso(start, i));
  const heat = habitDays(days, 5);
  const done = Object.keys(heat).length;
  const sample = candles(24, 186, 2);

  return (
    <CatalogSection title={t('catalog.sections.charts')}>
      <CatalogSubheading>{t('catalog.charts.tiles')}</CatalogSubheading>
      <View style={styles.tiles}>
        <Card style={styles.tile}>
          <StatTile
            label={t('catalog.charts.netWorth')}
            value={
              <AmountText
                value={(netWorth.at(-1) ?? 0).toString()}
                currency="COP"
                locale={locale}
                variant="numL"
              />
            }
            delta="4.6"
            locale={locale}
            trend={netWorth}
            trendLabel={t(
              trendOf(netWorth) === 'down' ? 'catalog.charts.trendDown' : 'catalog.charts.trendUp',
            )}
          />
        </Card>
        <Card style={styles.tile}>
          <StatTile
            label={t('catalog.charts.monthSpend')}
            value={
              <AmountText
                value={(month.at(-1) ?? 0).toString()}
                currency="COP"
                locale={locale}
                variant="numL"
              />
            }
            delta="-3.5"
            locale={locale}
            trend={month}
            trendLabel={t(
              trendOf(month) === 'down' ? 'catalog.charts.trendDown' : 'catalog.charts.trendUp',
            )}
          />
        </Card>
        <Card style={styles.tile}>
          <StatTile label={t('catalog.charts.habitsDone')} value="4/5" />
          <Sparkline
            values={habits}
            tone="accent"
            area
            height={40}
            accessibilityLabel={t('catalog.charts.habitsDone')}
          />
        </Card>
      </View>

      <CatalogSubheading>{t('catalog.charts.area')}</CatalogSubheading>
      <Text tone="muted">{t('catalog.charts.areaHint')}</Text>
      <AreaChart
        data={area}
        formatValue={millions}
        accessibilityLabel={t('catalog.charts.areaLabel', {
          from: millions(first),
          to: millions(last),
        })}
        markers={[
          { index: Math.floor(count * 0.3), kind: 'buy' },
          { index: Math.floor(count * 0.75), kind: 'sell' },
        ]}
        ranges={RANGES.map((value) => ({ value, label: t(`catalog.charts.ranges.${value}`) }))}
        range={range}
        onRangeChange={setRange}
        rangeLabel={t('catalog.charts.range')}
      />

      <View style={styles.pair}>
        <View style={styles.half}>
          <CatalogSubheading>{t('catalog.charts.candles')}</CatalogSubheading>
          <CandleChart
            candles={sample}
            accessibilityLabel={t('catalog.charts.candlesLabel', { count: sample.length })}
          />
        </View>
        <View style={styles.half}>
          <CatalogSubheading>{t('catalog.charts.bars')}</CatalogSubheading>
          <BarChart
            data={bars}
            formatValue={(value) =>
              (value / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })
            }
            accessibilityLabel={t('catalog.charts.barsLabel')}
          />
          <Text variant="label" tone="muted">
            {t('catalog.charts.balance')}
          </Text>
          <BarChart
            orientation="horizontal"
            data={[
              { label: t('catalog.charts.assets'), value: 312_000_000, color: theme.colors.gain },
              {
                label: t('catalog.charts.liabilities'),
                value: 98_000_000,
                color: theme.colors.loss,
              },
            ]}
            formatValue={millions}
            accessibilityLabel={t('catalog.charts.balance')}
          />
        </View>
      </View>

      <View style={styles.pair}>
        <View style={styles.half}>
          <CatalogSubheading>{t('catalog.charts.donut')}</CatalogSubheading>
          <DonutChart
            data={donut}
            accessibilityLabel={t('catalog.charts.donutLabel')}
            selected={slice}
            onSelect={setSlice}
            describeSlice={(i) =>
              t('catalog.charts.share', { label: donut[i]?.label ?? '', percent: SHARES[i] ?? 0 })
            }
          >
            <Text variant="caption" tone="muted">
              {slice === null ? t('catalog.charts.total') : donut[slice]?.label}
            </Text>
            <Text variant="numL">
              {slice === null ? '100 %' : `${(SHARES[slice] ?? 0).toString()} %`}
            </Text>
          </DonutChart>
        </View>
        <View style={styles.half}>
          <CatalogSubheading>{t('catalog.charts.heatmap')}</CatalogSubheading>
          <HeatmapCalendar
            start={start}
            end={today}
            values={heat}
            locale={locale}
            accessibilityLabel={t('catalog.charts.heatmapLabel', { days: done })}
            legend={{ less: t('catalog.charts.less'), more: t('catalog.charts.more') }}
          />
        </View>
      </View>
    </CatalogSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[3],
  },
  tile: {
    flexGrow: 1,
    flexBasis: 220,
  },
  pair: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[6],
  },
  half: {
    flexGrow: 1,
    flexBasis: 300,
    gap: theme.space[3],
  },
}));
