import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { i18n } from '@/shared/i18n';

import { UiCatalogPage } from './ui-catalog-page';

// Igual que ui-catalog-page.test.tsx: el sistema "reduce movimiento" para que el logo animado no
// pida cuadros sin parar. Aquí se recorren las demos de las secciones de F1.5 y F1.6.
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual<Record<string, unknown>>('react-native-reanimated');
  return { __esModule: true, ...actual, default: actual['default'], useReducedMotion: () => true };
});

const renderPage = () => render(<UiCatalogPage />, { wrapper: GestureHandlerRootView });

/** Espera real (temporizadores de la página: debounce, salida de toasts y hojas). */
const wait = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

/**
 * El último elemento con ese rol y nombre: el de la sección de más abajo o el de la hoja abierta
 * (hay textos repetidos entre secciones, como "Cancelar" o "Este mes").
 */
const last = (role: 'button' | 'checkbox', name: string) => {
  const element = screen.getAllByRole(role, { name }).at(-1);
  if (!element) throw new Error(`No ${role} named ${name}`);
  return element;
};
const lastButton = (name: string) => last('button', name);

describe('UiCatalogPage · overlays and navigation (F1.5)', () => {
  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
  });

  it('runs the progress, wizard, FAB, toast, sheet, dialog and offline demos', async () => {
    await renderPage();
    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar valores' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Siguiente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Atrás' }));
    expect(screen.getByRole('progressbar', { name: 'Paso 1 de 3' })).toBeOnTheScreen();

    const fab = screen.getByRole('button', { name: 'Nuevo gasto' });
    await fireEvent.press(fab);
    expect(fab).toBeExpanded();

    await fireEvent.press(screen.getByRole('button', { name: 'Info' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Éxito' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Error' }));
    expect(screen.getByText('Gasto guardado.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Hoja automática' }));
    await fireEvent.press(lastButton('Cerrar'));
    await wait(200);
    await fireEvent.press(screen.getByRole('button', { name: 'Hoja completa' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar' }));
    await wait(200);

    await fireEvent.press(screen.getByRole('button', { name: 'Diálogo destructivo' }));
    await fireEvent.press(
      within(screen.getByLabelText('¿Eliminar el gasto?')).getByRole('button', {
        name: 'Cancelar',
      }),
    );
    await wait(200);

    await fireEvent.press(screen.getByRole('button', { name: 'Simular sin conexión' }));
    expect(screen.getByText(/Sin conexión\./)).toBeOnTheScreen();
    await fireEvent.press(lastButton('Reintentar'));
    await wait(250);
    expect(screen.queryByText(/Sin conexión\./)).toBeNull();
  });
});

describe('UiCatalogPage · forms and lists (F1.6)', () => {
  it('fills the text fields, toggles and pickers', async () => {
    await renderPage();
    await fireEvent.changeText(screen.getByLabelText('Nota'), 'Almuerzo');
    expect(screen.getByText('8/40')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Comercio'), 'Rappi');
    expect(screen.queryByText('Escribe el nombre del comercio.')).toBeNull();

    await fireEvent.press(
      within(screen.getByLabelText('Moneda')).getByRole('radio', { name: 'USD' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: '1' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Separador decimal' }));
    await fireEvent.press(screen.getByRole('button', { name: '5' }));
    expect(screen.getByLabelText('Monto')).toHaveProp('value', '1,5');
    await fireEvent(screen.getByRole('button', { name: 'Borrar' }), 'longPress');
    expect(screen.getByLabelText('Monto')).toHaveProp('value', '');

    await fireEvent.press(
      screen.getByRole('button', { name: 'Categorías (varias), Elige una o más' }),
    );
    await fireEvent.press(last('checkbox', 'Ocio'));
    await fireEvent.press(lastButton('Listo'));
    await wait(200);
    expect(screen.getByRole('button', { name: 'Categorías (varias), Ocio' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Fecha, Elige una fecha' }));
    await fireEvent.press(last('checkbox', 'Hoy'));
    await fireEvent.press(lastButton('Listo'));
    await wait(200);
    await fireEvent.press(screen.getByRole('button', { name: 'Período, Elige una fecha' }));
    await fireEvent.press(last('checkbox', 'Este mes'));
    await fireEvent.press(lastButton('Listo'));
    await wait(200);
    await fireEvent.press(screen.getByRole('button', { name: 'Recordatorio, Elige una fecha' }));
    await fireEvent.press(last('checkbox', 'Ayer'));
    await fireEvent.press(screen.getByRole('button', { name: 'Después' }));
    await fireEvent.press(lastButton('Listo'));
    await wait(200);
    expect(screen.getByRole('button', { name: /^Recordatorio, .*09:05$/ })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('switch', { name: 'Mostrar gamificación' }));
    expect(screen.getByRole('switch', { name: 'Mostrar gamificación' })).not.toBeChecked();
    const food = screen.getAllByRole('checkbox', { name: 'Comida' }).at(-1);
    if (food) await fireEvent.press(food);
    const transport = screen.getAllByRole('checkbox', { name: 'Transporte' }).at(-1);
    if (transport) await fireEvent.press(transport);
    await fireEvent.press(
      within(screen.getByLabelText('Frecuencia')).getByRole('radio', { name: 'Semanal' }),
    );
    expect(
      within(screen.getByLabelText('Frecuencia')).getByRole('radio', { name: 'Semanal' }),
    ).toBeChecked();
  });

  it('searches with a delay and cancels', async () => {
    await renderPage();
    const input = screen.getByLabelText('Buscar comercio');
    await fireEvent.changeText(input, 'rap');
    await wait(300);
    expect(screen.getByText('Buscando: «rap»')).toBeOnTheScreen();
    await fireEvent(input, 'focus');
    await fireEvent.press(lastButton('Cancelar'));
    await wait(50);
    expect(screen.queryByText('Buscando: «rap»')).toBeNull();
  });

  it('edits, deletes, undoes and refreshes the sample list', async () => {
    await renderPage();
    await fireEvent(screen.getByLabelText('Rappi, Comida'), 'accessibilityAction', {
      nativeEvent: { actionName: 'Editar' },
    });
    expect(screen.getByText('Editar «Rappi»')).toBeOnTheScreen();

    await fireEvent(screen.getByLabelText('Uber, Transporte'), 'accessibilityAction', {
      nativeEvent: { actionName: 'Eliminar' },
    });
    await wait(50);
    expect(screen.queryByLabelText('Uber, Transporte')).toBeNull();
    expect(screen.getByText('«Uber» eliminado.')).toBeOnTheScreen();
    await fireEvent.press(lastButton('Deshacer'));
    expect(screen.getByLabelText('Uber, Transporte')).toBeOnTheScreen();

    await fireEvent(screen.getByTestId('forms-refresh'), 'accessibilityAction', {
      nativeEvent: { actionName: 'refresh' },
    });
    await wait(1300);
    expect(screen.getByText('Lista actualizada.')).toBeOnTheScreen();
  });
});

describe('UiCatalogPage · charts (F1.7)', () => {
  it('switches the area range and selects a donut segment', async () => {
    await renderPage();
    await fireEvent.press(
      within(screen.getByLabelText('Rango')).getByRole('radio', { name: '1A' }),
    );
    expect(within(screen.getByLabelText('Rango')).getByRole('radio', { name: '1A' })).toBeChecked();
    const donut = screen.getByRole('adjustable', { name: 'Gasto por categoría' });
    await fireEvent(donut, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(donut).toHaveAccessibilityValue({ text: 'Comida, 42 %' });
    expect(screen.getByRole('image', { name: /^Hábito «Leer»: \d+ días/ })).toBeOnTheScreen();
  });
});
