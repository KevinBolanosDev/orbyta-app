import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { UnistylesRuntime } from 'react-native-unistyles';

import { i18n } from '@/shared/i18n';
import { setThemePreference } from '@/shared/ui';

import { UiCatalogPage } from './ui-catalog-page';

// Varios grupos tienen "Sistema": se busca la opción dentro del grupo (su accessibilityLabel).
const radioIn = (group: string, option: string) =>
  within(screen.getByLabelText(group)).getByRole('radio', { name: option });

describe('UiCatalogPage', () => {
  // La página sigue montada aquí (la limpieza de Testing Library corre después), así que volver al
  // tema y al idioma por defecto la re-renderiza: va dentro de act para no dejar avisos.
  afterEach(async () => {
    await act(async () => {
      setThemePreference('system');
      await i18n.changeLanguage('es');
    });
  });

  it('shows every F1.1 and F1.2 section in Spanish', async () => {
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
      'Vidrio y aurora',
      'Movimiento',
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
    await fireEvent.press(radioIn('Tema', 'Oscuro'));
    expect(setTheme).toHaveBeenCalledWith('dark');
    expect(radioIn('Tema', 'Oscuro')).toBeChecked();
    expect(radioIn('Tema', 'Sistema')).not.toBeChecked();
    setTheme.mockRestore();
  });

  it('forces reduced motion, reduced transparency and the dimmed aurora', async () => {
    await render(<UiCatalogPage />);
    await fireEvent.press(radioIn('Movimiento', 'Reducido'));
    await fireEvent.press(radioIn('Transparencia', 'Reducida'));
    await fireEvent.press(radioIn('Aurora', 'Atenuada'));
    expect(radioIn('Movimiento', 'Reducido')).toBeChecked();
    expect(radioIn('Transparencia', 'Reducida')).toBeChecked();
    expect(radioIn('Aurora', 'Atenuada')).toBeChecked();
  });

  it('replays the motion demos', async () => {
    await render(<UiCatalogPage />);
    await fireEvent.press(screen.getByRole('button', { name: 'Repetir animaciones' }));
    const pressDemo = screen.getByRole('button', { name: 'M02 · Presión (tócame)' });
    await fireEvent.press(pressDemo);
    expect(within(pressDemo).getByText('1')).toBeOnTheScreen();
  });
});
