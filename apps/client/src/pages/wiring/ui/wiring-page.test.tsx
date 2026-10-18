import { fireEvent, render, screen } from '@testing-library/react-native';

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
    expect(await screen.findByText('API online · v1.2.3')).toBeOnTheScreen();
    expect(screen.getByTestId('today')).toHaveTextContent(/^Today: \d{4}-\d{2}-\d{2}$/);
  });

  it('shows the API as offline when the request fails', async () => {
    mockFetch(Promise.reject(new Error('network down')));
    await render(<WiringPage />);
    expect(await screen.findByText('API offline')).toBeOnTheScreen();
  });

  it('calculates the average cost with @repo/finance on the client', async () => {
    mockFetch(Promise.reject(new Error('offline is fine for local math')));
    await render(<WiringPage />);

    await fireEvent.changeText(screen.getByLabelText('Current quantity'), '10');
    await fireEvent.changeText(screen.getByLabelText('Current average cost'), '100');
    await fireEvent.changeText(screen.getByLabelText('Buy quantity'), '5');
    await fireEvent.changeText(screen.getByLabelText('Buy price'), '130');
    await fireEvent.press(screen.getByText('Calculate'));

    expect(screen.getByTestId('buy-preview-result')).toHaveTextContent(
      'New average cost: 110.00 USD',
    );
  });

  it('shows the error code when the input breaks the contract', async () => {
    mockFetch(Promise.reject(new Error('offline')));
    await render(<WiringPage />);

    await fireEvent.changeText(screen.getByLabelText('Buy quantity'), '1');
    await fireEvent.changeText(screen.getByLabelText('Buy price'), 'abc');
    await fireEvent.changeText(screen.getByLabelText('Fee'), '0');
    await fireEvent.press(screen.getByText('Calculate'));

    expect(screen.getByTestId('buy-preview-error')).toHaveTextContent('VALIDATION_FAILED');
  });
});
