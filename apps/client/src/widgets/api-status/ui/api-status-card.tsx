import { StatusBadge } from '@/entities/system-status';
import { useTranslation } from '@/shared/i18n';
import { Card, SectionHeader } from '@/shared/ui';

import { useSystemStatus } from '../model/use-system-status';

export function ApiStatusCard() {
  const { t } = useTranslation();
  const status = useSystemStatus();
  return (
    <Card header={<SectionHeader title={t('wiring.api.title')} />} enterIndex={1}>
      <StatusBadge status={status} />
    </Card>
  );
}
