import { router } from 'expo-router';
import Palette from 'lucide-react-native/icons/palette';
import { useState } from 'react';

import { toIsoDate } from '@repo/utils';

import { PreviewBuyForm } from '@/features/preview-buy';
import { DEFAULT_TIME_ZONE, isDevCatalogEnabled } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { BrandLockup, Button, Card, Screen, Text } from '@/shared/ui';
import { ApiStatusCard } from '@/widgets/api-status';

/**
 * Página de cableado de F0: recorre todas las capas FSD (app → pages → widgets → features →
 * entities → shared) y usa @repo/contracts, @repo/finance y @repo/utils en el cliente.
 * Desde F1.4 usa los componentes de @repo/ui y los textos de @repo/i18n; en desarrollo enlaza el
 * catálogo /dev/ui. TODO(F2): reemplazar por el Hub (GLB-07) y borrar este slice.
 */
export function WiringPage() {
  const { t } = useTranslation();
  // La fecha se calcula una sola vez al montar; leer la hora durante el render lo haría impuro.
  const [today] = useState(() => toIsoDate(new Date(), DEFAULT_TIME_ZONE));

  return (
    <Screen>
      <Card hero enterIndex={0}>
        <BrandLockup height={56} accessibilityLabel={t('brand.name')} />
        <Text tone="muted">{t('brand.tagline')}</Text>
        <Text variant="caption" tone="muted" testID="today">
          {t('wiring.today', { date: today })}
        </Text>
        {isDevCatalogEnabled() ? (
          <Button
            label={t('wiring.openCatalog')}
            icon={Palette}
            variant="secondary"
            size="s"
            onPress={() => {
              router.push('/dev/ui');
            }}
          />
        ) : null}
      </Card>
      <ApiStatusCard />
      <PreviewBuyForm currency="USD" />
    </Screen>
  );
}
