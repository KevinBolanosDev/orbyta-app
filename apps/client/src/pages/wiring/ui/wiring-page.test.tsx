import { fireEvent, render, screen, within } from '@testing-library/react-native';

import { WiringPage } from './wiring-page';

const healthBody = {
  status: 'ok',
  service: 'api',
  version: '1.2.3',
  uptimeSeconds: 5,
  checkedAt: '2026-10-17T15:00:00.000Z',
};

function mockFetch(response: Promise<Response>) {
  globalThis.fetch = jest.fn(() => response);
}

// El polyfill de Response de React Native nunca resuelve `.json()` en Jest; se usa un stub mínimo.
const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: () => Promise.resolve(body) }) as unknown as Response;

describe('WiringPage', () => {
  it('shows the API as online when /health matches the contract', async () => {
    mockFetch(Promise.resolve(okResponse(healthBody)));
    await render(<WiringPage />);
    expect(await screen.findByText('API en línea · v1.2.3')).toBeOnTheScreen();
    expect(screen.getByTestId('today')).toHaveTextContent(/^Hoy: \d{4}-\d{2}-\d{2}$/);
  });

  it('shows the API as offline when the request fails', async () => {
    mockFetch(Promise.reject(new Error('network down')));
    await render(<WiringPage />);
    expect(await screen.findByText('API sin conexión')).toBeOnTheScreen();
  });

  it('calculates the average cost with @repo/finance on the client', async () => {
    mockFetch(Promise.reject(new Error('offline is fine for local math')));
    await render(<WiringPage />);

    await fireEvent.changeText(screen.getByLabelText('Cantidad actual'), '10');
    await fireEvent.changeText(screen.getByLabelText('Costo promedio actual'), '100');
    await fireEvent.changeText(screen.getByLabelText('Cantidad a comprar'), '5');
    await fireEvent.changeText(screen.getByLabelText('Precio de compra'), '130');
    await fireEvent.press(screen.getByRole('button', { name: 'Calcular' }));

    // La cifra cuenta hasta el valor (M03): se espera al texto final.
    const result = screen.getByTestId('buy-preview-result');
    expect(within(result).getByText('Nuevo costo promedio')).toBeOnTheScreen();
    expect(await within(result).findByText('US$ 110,00', {}, { timeout: 3000 })).toBeOnTheScreen();
  });

  it('shows the error code when the input breaks the contract', async () => {
    mockFetch(Promise.reject(new Error('offline')));
    await render(<WiringPage />);

    await fireEvent.changeText(screen.getByLabelText('Cantidad a comprar'), '1');
    await fireEvent.changeText(screen.getByLabelText('Precio de compra'), 'abc');
    await fireEvent.changeText(screen.getByLabelText('Comisión'), '0');
    await fireEvent.press(screen.getByRole('button', { name: 'Calcular' }));

    expect(screen.getByTestId('buy-preview-error')).toHaveTextContent(/VALIDATION_FAILED/);
  });
});
