import { fireEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import NotFoundRoute from '../src/app/+not-found';
import RootLayout from '../src/app/_layout';
import UiCatalogRoute from '../src/app/dev/ui';
import IndexRoute from '../src/app/index';

// Las pruebas de rutas viven fuera de src/app: todo archivo ahí debe ser una ruta (doc de Expo Router).
const routes = {
  _layout: RootLayout,
  index: IndexRoute,
  'dev/ui': UiCatalogRoute,
  '+not-found': NotFoundRoute,
};

describe('routes', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() => Promise.reject(new Error('no API in tests')));
  });

  it('renders the wiring page at /', async () => {
    await renderRouter(routes);
    expect(await screen.findByText('Gravyx Ascenda')).toBeOnTheScreen();
  });

  it('renders the UI catalog at /dev/ui in development', async () => {
    await renderRouter(routes, { initialUrl: '/dev/ui' });
    expect(await screen.findByRole('header', { name: 'Catálogo de UI' })).toBeOnTheScreen();
  });

  it('opens the UI catalog from the home page link', async () => {
    await renderRouter(routes);
    await fireEvent.press(await screen.findByRole('link', { name: 'Catálogo de UI' }));
    expect(await screen.findByRole('header', { name: 'Catálogo de UI' })).toBeOnTheScreen();
  });

  it('renders the not-found page for unknown paths', async () => {
    await renderRouter(routes, { initialUrl: '/does-not-exist' });
    expect(await screen.findByText('Page not found')).toBeOnTheScreen();
  });
});
