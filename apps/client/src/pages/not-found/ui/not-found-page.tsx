import { router } from 'expo-router';
import SearchX from 'lucide-react-native/icons/search-x';

import { useTranslation } from '@/shared/i18n';
import { EmptyState, Screen } from '@/shared/ui';

// TODO(F2): 404 dentro del layout de pantalla de design-system.md §6.1.
export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Screen>
      <EmptyState
        icon={SearchX}
        title={t('notFound.title')}
        message={t('notFound.message')}
        actionLabel={t('notFound.action')}
        onAction={() => {
          router.replace('/');
        }}
      />
    </Screen>
  );
}
