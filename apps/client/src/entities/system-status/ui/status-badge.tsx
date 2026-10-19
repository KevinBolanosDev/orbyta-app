import { useTranslation } from '@/shared/i18n';
import { Badge, type BadgeTone } from '@/shared/ui';

import type { SystemStatus } from '../model/system-status';

const TONE: Record<SystemStatus['kind'], BadgeTone> = {
  checking: 'neutral',
  online: 'gain',
  offline: 'loss',
};

/** Estado del API como insignia: consultando, en línea (con versión) o sin conexión. */
export function StatusBadge({ status }: { status: SystemStatus }) {
  const { t } = useTranslation();
  const label =
    status.kind === 'online'
      ? t('wiring.api.online', { version: status.health.version })
      : t(`wiring.api.${status.kind}`);
  return <Badge tone={TONE[status.kind]} label={label} testID="system-status" />;
}
