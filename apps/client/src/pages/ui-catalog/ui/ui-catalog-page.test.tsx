import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { UnistylesRuntime } from 'react-native-unistyles';

import { i18n } from '@/shared/i18n';
import { setThemePreference } from '@/shared/ui';

import { UiCatalogPage } from './ui-catalog-page';

// Varios grupos tienen "Sistema": se busca la opción dentro del grupo (su accessibilityLabel).
// El sistema "reduce movimiento": sin esto, el logo animado (M20) pide un cuadro nuevo sin parar y
// `act` nunca termina. Las animaciones se prueban en @repo/ui con temporizadores falsos.
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual<Record<string, unknown>>('react-native-reanimated');
  return { __esModule: true, ...actual, default: actual['default'], useReducedMotion: () => true };
});

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

  it('shows every F1 section in Spanish', async () => {
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
      'Marca',
      'Componentes',
      'Superposiciones y navegación',
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

  it('activates a module icon and replays the brand entrance', async () => {
    await render(<UiCatalogPage />);
    const stocks = screen.getByRole('button', { name: 'Bolsa' });
    await fireEvent.press(stocks);
    expect(stocks).toBeSelected();
    await fireEvent.press(stocks);
    expect(stocks).not.toBeSelected();
    await fireEvent.press(screen.getByRole('button', { name: 'Repetir entrada' }));
    expect(screen.getAllByRole('image', { name: 'Gravyx Ascenda' }).length).toBeGreaterThan(0);
  });

  it('opens a sheet, confirms the dialog and undoes from the toast', async () => {
    await render(<UiCatalogPage />);
    await fireEvent.press(screen.getByRole('button', { name: 'Media hoja' }));
    expect(screen.getByRole('header', { name: 'Filtrar movimientos' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Diálogo destructivo' }));
    await fireEvent.press(
      within(screen.getByLabelText('¿Eliminar el gasto?')).getByRole('button', {
        name: 'Eliminar',
      }),
    );
    expect(await screen.findByText('Gasto eliminado.')).toBeOnTheScreen();
    // El último "Deshacer" es la acción del toast (el primero es el botón de la sección).
    const undo = screen.getAllByRole('button', { name: 'Deshacer' }).at(-1);
    if (undo) await fireEvent.press(undo);
    expect(await screen.findByText('Se restauró el gasto.')).toBeOnTheScreen();
  });

  it('moves through the wizard and the period control', async () => {
    await render(<UiCatalogPage />);
    expect(screen.getByRole('progressbar', { name: 'Paso 1 de 3' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('progressbar', { name: 'Paso 2 de 3' })).toBeOnTheScreen();
    await fireEvent.press(radioIn('Período', 'Año'));
    expect(radioIn('Período', 'Año')).toBeChecked();
    await fireEvent.press(screen.getByRole('tab', { name: 'Créditos' }));
    expect(screen.getByText('Contenido de la pestaña «Créditos»')).toBeOnTheScreen();
  });

  it('hides the sample amounts with the privacy toggle', async () => {
    await render(<UiCatalogPage />);
    expect(screen.getByText('US$ 1.234,56')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Ocultar montos' }));
    expect(screen.queryByText('US$ 1.234,56')).toBeNull();
    expect(screen.getAllByLabelText('Monto oculto').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Mostrar montos' })).toBeSelected();
  });
});
