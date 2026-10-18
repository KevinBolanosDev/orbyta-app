import { Button } from 'react-native';

import type { CurrencyCode } from '@repo/contracts';
import { money, roundForDisplay } from '@repo/finance';

import { Body, Card, Field, Title } from '@/shared/ui';

import { useBuyPreview } from '../model/use-buy-preview';

// TODO(F1): los textos pasan a @repo/i18n (es/en) · TODO(F5): se convierte en la feature real register-trade.
export function PreviewBuyForm({ currency }: { currency: CurrencyCode }) {
  const { form, outcome, setField, calculate } = useBuyPreview(currency);

  return (
    <Card>
      <Title>Average cost preview</Title>
      <Field
        label="Current quantity"
        value={form.positionQuantity}
        onChangeText={(value) => {
          setField('positionQuantity', value);
        }}
      />
      <Field
        label="Current average cost"
        value={form.positionAverageCost}
        onChangeText={(value) => {
          setField('positionAverageCost', value);
        }}
      />
      <Field
        label="Buy quantity"
        value={form.buyQuantity}
        onChangeText={(value) => {
          setField('buyQuantity', value);
        }}
      />
      <Field
        label="Buy price"
        value={form.buyPrice}
        onChangeText={(value) => {
          setField('buyPrice', value);
        }}
      />
      <Field
        label="Fee"
        value={form.buyFee}
        onChangeText={(value) => {
          setField('buyFee', value);
        }}
      />
      <Button title="Calculate" onPress={calculate} />
      {outcome.kind === 'ok' && (
        <Body testID="buy-preview-result">
          {`New average cost: ${roundForDisplay(money(outcome.result.averageCost, outcome.result.currency))} ${outcome.result.currency}`}
        </Body>
      )}
      {outcome.kind === 'error' && <Body testID="buy-preview-error">{outcome.code}</Body>}
    </Card>
  );
}
