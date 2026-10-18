import { renderRouter, screen } from 'expo-router/testing-library';

import NotFoundRoute from '../src/app/+not-found';
import RootLayout from '../src/app/_layout';
import IndexRoute from '../src/app/index';

// Las pruebas de rutas viven fuera de src/app: todo archivo ahí debe ser una ruta (doc de Expo Router).
describe('routes', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() => Promise.reject(new Error('no API in tests')));
  });

  it('renders the wiring page at /', async () => {
    await renderRouter({ _layout: RootLayout, index: IndexRoute, '+not-found': NotFoundRoute });
    expect(await screen.findByText('Gravyx Ascenda')).toBeOnTheScreen();
  });

  it('renders the not-found page for unknown paths', async () => {
    await renderRouter(
      { _layout: RootLayout, index: IndexRoute, '+not-found': NotFoundRoute },
      { initialUrl: '/does-not-exist' },
    );
    expect(await screen.findByText('Page not found')).toBeOnTheScreen();
  });
});
