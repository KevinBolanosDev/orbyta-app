import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { toIsoDate } from '@repo/utils';

import { PreviewBuyForm } from '@/features/preview-buy';
import { DEFAULT_TIME_ZONE, isDevCatalogEnabled } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { Body, Screen, Title } from '@/shared/ui';
import { ApiStatusCard } from '@/widgets/api-status';

/**
 * Página de cableado de F0: recorre todas las capas FSD (app → pages → widgets → features →
 * entities → shared) y usa @repo/contracts, @repo/finance y @repo/utils en el cliente.
 * En desarrollo enlaza el catálogo /dev/ui (F1).
 * TODO(F2): reemplazar por el Hub (GLB-07) y borrar este slice.
 */
export function WiringPage() {
  const { t } = useTranslation();
  // La fecha se calcula una sola vez al montar; leer la hora durante el render lo haría impuro.
  const [today] = useState(() => toIsoDate(new Date(), DEFAULT_TIME_ZONE));

  return (
    <Screen>
      <Title>Gravyx Ascenda</Title>
      <Body>Your ascent begins here.</Body>
      <Body testID="today">{`Today: ${today}`}</Body>
      {isDevCatalogEnabled() ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            router.push('/dev/ui');
          }}
        >
          <Body>{t('catalog.title')}</Body>
        </Pressable>
      ) : null}
      <ApiStatusCard />
      <PreviewBuyForm currency="USD" />
    </Screen>
  );
}
