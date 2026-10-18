import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { UnistylesRuntime } from 'react-native-unistyles';

import { i18n } from '@/shared/i18n';
import { setThemePreference } from '@/shared/ui';

import { UiCatalogPage } from './ui-catalog-page';

describe('UiCatalogPage', () => {
  // La página sigue montada aquí (la limpieza de Testing Library corre después), así que volver al
  // tema y al idioma por defecto la re-renderiza: va dentro de act para no dejar avisos.
  afterEach(async () => {
    await act(async () => {
      setThemePreference('system');
      await i18n.changeLanguage('es');
    });
  });

  it('shows every F1.1 section in Spanish', async () => {
    await render(<UiCatalogPage />);
    expect(screen.getByRole('header', { name: 'Catálogo de UI' })).toBeOnTheScreen();
    for (const section of [
      'Colores semánticos',
      'Categorías y series',
      'Colores de módulo',
      'Degradado holográfico',
      'Tipografía',
      'Espaciado',
      'Radios',
      'Elevación',
    ]) {
      expect(screen.getByRole('header', { name: section })).toBeOnTheScreen();
    }
    expect(screen.getByText('Breakpoint actual: compact')).toBeOnTheScreen();
  });

  it('switches the language in place', async () => {
    await render(<UiCatalogPage />);
    await fireEvent.press(screen.getByRole('radio', { name: 'English' }));
    expect(await screen.findByRole('header', { name: 'UI catalog' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
  });

  it('applies the chosen theme without leaving the page', async () => {
    const setTheme = jest.spyOn(UnistylesRuntime, 'setTheme');
    await render(<UiCatalogPage />);
    await fireEvent.press(screen.getByRole('radio', { name: 'Oscuro' }));
    expect(setTheme).toHaveBeenCalledWith('dark');
    expect(screen.getByRole('radio', { name: 'Oscuro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Sistema' })).not.toBeChecked();
    setTheme.mockRestore();
  });
});
