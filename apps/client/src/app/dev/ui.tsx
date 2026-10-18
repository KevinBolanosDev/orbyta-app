// Ruta `/dev/ui`: catálogo visual del design system (ADR 0018). Si el catálogo no está habilitado
// (build de release sin EXPO_PUBLIC_DEV_CATALOG=1) muestra el 404.
import { NotFoundPage } from '@/pages/not-found';
import { UiCatalogPage } from '@/pages/ui-catalog';
import { isDevCatalogEnabled } from '@/shared/config';

export default function UiCatalogRoute() {
  return isDevCatalogEnabled() ? <UiCatalogPage /> : <NotFoundPage />;
}
