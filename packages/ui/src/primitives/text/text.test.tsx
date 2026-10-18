import { render, screen } from '@testing-library/react-native';

import { lightTheme } from '../../theme/themes';
import { MAX_FONT_SCALE } from '../../tokens';

import { Text } from './text';

// En Jest, Unistyles usa sus mocks: los estilos se resuelven con el primer tema registrado (claro)
// y las variantes no se aplican. Aquí se prueba el comportamiento, no el CSS.

describe('Text (P01)', () => {
  it('renders its children', async () => {
    await render(<Text variant="titleL">Patrimonio neto</Text>);
    expect(screen.getByText('Patrimonio neto')).toBeOnTheScreen();
  });

  it('caps dynamic type at 1.3× by default', async () => {
    await render(<Text>Monto</Text>);
    expect(screen.getByText('Monto').props).toMatchObject({
      maxFontSizeMultiplier: MAX_FONT_SCALE,
    });
  });

  it('lets the caller override the cap and pass native props', async () => {
    await render(
      <Text maxFontSizeMultiplier={1} numberOfLines={1} accessibilityRole="header">
        Título
      </Text>,
    );
    expect(screen.getByRole('header').props).toMatchObject({
      maxFontSizeMultiplier: 1,
      numberOfLines: 1,
    });
  });

  it('uses the theme ink color and merges the caller style', async () => {
    await render(<Text style={{ opacity: 0.5 }}>Hola</Text>);
    expect(screen.getByText('Hola')).toHaveStyle({ color: lightTheme.colors.ink, opacity: 0.5 });
  });
});
