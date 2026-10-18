import { Body } from '@/shared/ui';

import type { SystemStatus } from '../model/system-status';

// TODO(F1): los textos pasan a @repo/i18n (es/en).
const LABELS: Record<SystemStatus['kind'], string> = {
  checking: 'Checking API…',
  online: 'API online',
  offline: 'API offline',
};

export function StatusBadge({ status }: { status: SystemStatus }) {
  const detail = status.kind === 'online' ? ` · v${status.health.version}` : '';
  return <Body testID="system-status">{`${LABELS[status.kind]}${detail}`}</Body>;
}
