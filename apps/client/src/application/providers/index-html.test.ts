import { darkColors, lightColors, THEME_PREFERENCE_KEY } from '@/shared/ui';

// public/index.html pinta el fondo y aplica el tema guardado antes de que cargue el JS (ADR 0012).
// Como es HTML estático no puede importar los tokens; esta prueba evita que se desalineen.

const fs = jest.requireActual<{ readFileSync: (path: string, encoding: 'utf8') => string }>('fs');

function readIndexHtml(): string {
  const testPath = expect.getState().testPath ?? '';
  const clientRoot = testPath.replace(/[\\/]src[\\/].*$/, '');
  return fs.readFileSync(`${clientRoot}/public/index.html`, 'utf8').toLowerCase();
}

describe('public/index.html', () => {
  const html = readIndexHtml();

  it('reads the same storage key as the theme preference', () => {
    expect(html).toContain(`localstorage.getitem('${THEME_PREFERENCE_KEY}')`);
  });

  it('paints the background of both themes with the bg tokens', () => {
    expect(html).toContain(`background-color: ${darkColors.bg.toLowerCase()}`);
    expect(html).toContain(`background-color: ${lightColors.bg.toLowerCase()}`);
  });
});
