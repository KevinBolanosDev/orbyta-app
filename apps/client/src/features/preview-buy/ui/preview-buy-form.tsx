import Calculator from 'lucide-react-native/icons/calculator';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { CurrencyCode } from '@repo/contracts';
import { money, roundForDisplay } from '@repo/finance';

import { useTranslation } from '@/shared/i18n';
import { AmountText, Button, Card, ErrorState, Field, SectionHeader, Text } from '@/shared/ui';

import { useBuyPreview, type BuyPreviewForm } from '../model/use-buy-preview';

const FIELDS: readonly (keyof BuyPreviewForm)[] = [
  'positionQuantity',
  'positionAverageCost',
  'buyQuantity',
  'buyPrice',
  'buyFee',
];

// TODO(F5): se convierte en la feature real register-trade.
export function PreviewBuyForm({ currency }: { currency: CurrencyCode }) {
  const { t } = useTranslation();
  const { form, outcome, setField, calculate } = useBuyPreview(currency);

  return (
    <Card header={<SectionHeader title={t('wiring.preview.title')} />} enterIndex={2}>
      {FIELDS.map((field) => (
        <Field
          key={field}
          label={t(`wiring.preview.${field}`)}
          value={form[field]}
          onChangeText={(value) => {
            setField(field, value);
          }}
        />
      ))}
      <Button
        label={t('wiring.preview.calculate')}
        icon={Calculator}
        onPress={calculate}
        fullWidth
      />
      {outcome.kind === 'ok' && (
        <View style={styles.result} testID="buy-preview-result">
          <Text variant="label" tone="muted">
            {t('wiring.preview.result')}
          </Text>
          <AmountText
            value={roundForDisplay(money(outcome.result.averageCost, outcome.result.currency))}
            currency={outcome.result.currency}
            variant="numL"
            animate
          />
        </View>
      )}
      {outcome.kind === 'error' && (
        <ErrorState
          inline
          title={t('wiring.preview.error')}
          message={t('wiring.preview.errorCode', { code: outcome.code })}
          testID="buy-preview-error"
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  result: {
    gap: theme.space[1],
  },
}));
