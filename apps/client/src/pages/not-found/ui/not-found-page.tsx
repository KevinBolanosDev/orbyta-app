import { Link } from 'expo-router';

import { Body, Screen, Title } from '@/shared/ui';

// TODO(F1): los textos pasan a @repo/i18n · TODO(F2): 404 con el estilo de design-system.md.
export function NotFoundPage() {
  return (
    <Screen>
      <Title>Page not found</Title>
      <Link href="/">
        <Body>Go home</Body>
      </Link>
    </Screen>
  );
}
