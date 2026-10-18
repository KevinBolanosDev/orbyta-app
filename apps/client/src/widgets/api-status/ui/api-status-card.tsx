import { StatusBadge } from '@/entities/system-status';
import { Card, Title } from '@/shared/ui';

import { useSystemStatus } from '../model/use-system-status';

export function ApiStatusCard() {
  const status = useSystemStatus();
  return (
    <Card>
      <Title>Backend</Title>
      <StatusBadge status={status} />
    </Card>
  );
}
