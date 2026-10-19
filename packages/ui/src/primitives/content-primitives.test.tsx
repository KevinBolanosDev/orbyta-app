import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import Plus from 'lucide-react-native/icons/plus';
import { Text as NativeText } from 'react-native';

import { MINUS } from '../lib/format-number';
import { AccessibilityPreferencesProvider } from '../motion/accessibility-preferences';

import {
  AmountPrivacyProvider,
  AmountText,
  DeltaText,
  useAmountPrivacy,
} from './amount-text/amount-text';
import { Avatar, colorIndexOf, initialsOf } from './avatar/avatar';
import { Badge } from './badge/badge';
import { Button } from './button/button';
import { Card } from './card/card';
import { Chip } from './chip/chip';
import { EmptyState, ErrorState } from './feedback-state/feedback-state';
import { Icon, IconColorProvider } from './icon/icon';
import { IconButton } from './icon-button/icon-button';
import { SectionHeader } from './section-header/section-header';
import { Skeleton } from './skeleton/skeleton';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

describe('Icon (P02)', () => {
  it('is decorative unless it has a label, and takes the inherited color', async () => {
    await render(
      <>
        <IconColorProvider color="#123456">
          <Icon icon={Plus} testID="inherited" />
        </IconColorProvider>
        <Icon icon={Plus} size="empty" tone="loss" accessibilityLabel="Agregar" />
        <Icon icon={Plus} size="inline" color="#ABCDEF" testID="explicit" />
      </>,
    );
    expect(screen.getByLabelText('Agregar')).toBeOnTheScreen();
    expect(screen.getByTestId('inherited', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('explicit', { includeHiddenElements: true })).toBeTruthy();
  });
});

describe('Button (P03) and IconButton (P04)', () => {
  it('presses and exposes its label and state', async () => {
    const onPress = jest.fn();
    await render(<Button label="Guardar" icon={Plus} onPress={onPress} fullWidth />);
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not respond while loading or disabled', async () => {
    const onPress = jest.fn();
    await render(
      <>
        <Button label="Guardando" loading onPress={onPress} variant="secondary" />
        <Button label="No disponible" disabled onPress={onPress} variant="danger" size="s" />
        <Button label="Ver" variant="ghost" />
      </>,
    );
    const loading = screen.getByRole('button', { name: 'Guardando' });
    expect(loading).toBeDisabled();
    expect(loading).toBeBusy();
    await fireEvent.press(screen.getByRole('button', { name: 'No disponible' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('requires a label on icon buttons and reports the toggle state', async () => {
    const onPress = jest.fn();
    await render(
      <>
        <IconButton icon={Plus} accessibilityLabel="Agregar" onPress={onPress} />
        <IconButton
          icon={Plus}
          accessibilityLabel="Ocultar"
          variant="plain"
          tone="primary"
          selected
        />
        <IconButton icon={Plus} accessibilityLabel="Bloqueado" disabled />
      </>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Agregar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Ocultar' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Bloqueado' })).toBeDisabled();
  });
});

describe('Card (P06) and SectionHeader (P27)', () => {
  it('renders header, body and footer, and can be pressed', async () => {
    const onPress = jest.fn();
    const onAction = jest.fn();
    await render(
      <>
        <Card
          header={<SectionHeader title="Recientes" actionLabel="Ver todo" onAction={onAction} />}
          footer={<NativeText>Pie</NativeText>}
          enterIndex={1}
        >
          <NativeText>Cuerpo</NativeText>
        </Card>
        <Card hero onPress={onPress} accessibilityLabel="Patrimonio">
          <NativeText>Héroe</NativeText>
        </Card>
        <SectionHeader title="Sin acción" />
      </>,
    );
    expect(screen.getByRole('header', { name: 'Recientes' })).toBeOnTheScreen();
    expect(screen.getByText('Pie')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Ver todo' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Patrimonio' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Chip (P13)', () => {
  it('works as a filter, an input with remove and a category tag', async () => {
    const onPress = jest.fn();
    const onRemove = jest.fn();
    await render(
      <>
        <Chip label="Este mes" selected onPress={onPress} />
        <Chip label="Comida" variant="input" removeLabel="Quitar Comida" onRemove={onRemove} />
        <Chip label="Transporte" variant="category" color="#4C7DFF" icon={Plus} />
        <Chip label="Botón" variant="category" onPress={onPress} />
      </>,
    );
    const filter = screen.getByRole('checkbox', { name: 'Este mes' });
    expect(filter).toBeChecked();
    await fireEvent.press(filter);
    await fireEvent.press(screen.getByRole('button', { name: 'Quitar Comida' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Transporte')).toBeOnTheScreen();
  });
});

describe('Badge (P16) and Avatar (P17)', () => {
  it('shows text, capped numbers and labelled dots', async () => {
    await render(
      <>
        <Badge label="Sano" tone="gain" />
        <Badge label={128} max={99} tone="primary" accessibilityLabel="128 sin leer" />
        <Badge label={7} max={99} />
        <Badge tone="loss" accessibilityLabel="Hay alertas" />
        <Badge tone="warning" testID="dot" />
      </>,
    );
    expect(screen.getByText('Sano')).toBeOnTheScreen();
    expect(screen.getByText('99+')).toBeOnTheScreen();
    expect(screen.getByText('7')).toBeOnTheScreen();
    expect(screen.getByLabelText('Hay alertas')).toBeOnTheScreen();
  });

  it('builds initials and a stable color, or shows the logo', async () => {
    expect(initialsOf('ana maría gómez')).toBe('AG');
    expect(initialsOf('Rappi')).toBe('R');
    expect(initialsOf('   ')).toBe('');
    expect(colorIndexOf('Bancolombia', 8)).toBe(colorIndexOf('Bancolombia', 8));
    await render(
      <>
        <Avatar name="Ana Gómez" />
        <Avatar name="Broker" imageUri="https://example.com/logo.png" size={32} />
      </>,
    );
    expect(within(screen.getByRole('image', { name: 'Ana Gómez' })).getByText('AG')).toBeTruthy();
    expect(screen.getByRole('image', { name: 'Broker' })).toBeOnTheScreen();
  });
});

describe('Skeleton (P20)', () => {
  it('renders every shape, sweeping or still', async () => {
    await render(
      <>
        <Skeleton testID="line" />
        <Skeleton shape="block" width="50%" height={80} />
        <AccessibilityPreferencesProvider reduceMotion>
          <Skeleton shape="circle" />
        </AccessibilityPreferencesProvider>
      </>,
    );
    const line = screen.getByTestId('line', { includeHiddenElements: true });
    await fireEvent(line, 'layout', { nativeEvent: { layout: { width: 200, height: 12 } } });
    expect(line.props).toMatchObject({ importantForAccessibility: 'no-hide-descendants' });
  });
});

describe('EmptyState (P21) and ErrorState (P22)', () => {
  it('shows the message and runs the action or retry', async () => {
    const onAction = jest.fn();
    const onRetry = jest.fn();
    await render(
      <>
        <EmptyState
          icon={Plus}
          title="Sin movimientos"
          message="Registra uno"
          actionLabel="Registrar"
          onAction={onAction}
        />
        <EmptyState title="Vacío" />
        <ErrorState
          title="No se pudo cargar"
          message="Sin red"
          retryLabel="Reintentar"
          onRetry={onRetry}
        />
        <ErrorState inline title="Falló" message="Código" testID="inline" />
      </>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Registrar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.getByTestId('inline')).toHaveTextContent(/Falló/);
  });
});

describe('AmountText (P28) and DeltaText (P29)', () => {
  it('formats the amount and colors it by sign', async () => {
    await render(
      <>
        <AmountText value="1234567" currency="COP" />
        <AmountText value="-85400" currency="COP" colorBySign testID="negative" />
        <AmountText value="1234.5" currency="USD" locale="en-US" signDisplay="always" />
      </>,
    );
    expect(screen.getByText('$ 1.234.567')).toBeOnTheScreen();
    expect(screen.getByTestId('negative')).toHaveTextContent(`${MINUS}$ 85.400`);
    expect(screen.getByText('+US$ 1,234.50')).toBeOnTheScreen();
  });

  it('hides every amount in privacy mode, with a spoken label', async () => {
    function PrivacyState() {
      return <NativeText>{useAmountPrivacy() ? 'privado' : 'visible'}</NativeText>;
    }
    await render(
      <AmountPrivacyProvider hidden hiddenLabel="Monto oculto">
        <AmountText value="1234567" currency="COP" colorBySign />
        <AmountText value="10" currency="USD" hidden={false} />
        <PrivacyState />
      </AmountPrivacyProvider>,
    );
    expect(screen.getByLabelText('Monto oculto')).toHaveTextContent('$ •••');
    expect(screen.getByText('US$ 10,00')).toBeOnTheScreen();
    expect(screen.getByText('privado')).toBeOnTheScreen();
  });

  it('counts up to the exact value (M03)', async () => {
    jest.useFakeTimers();
    await render(
      <AccessibilityPreferencesProvider reduceMotion={false}>
        <AmountText value="48250000" currency="COP" animate testID="hero" />
      </AccessibilityPreferencesProvider>,
    );
    expect(screen.getByTestId('hero')).toHaveTextContent('$ 0');
    await act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.getByTestId('hero')).toHaveTextContent('$ 48.250.000');
    jest.useRealTimers();
  });

  it('shows arrows and signs, read without arrows', async () => {
    await render(
      <>
        <DeltaText value="2.4" />
        <DeltaText value="-1" locale="en-US" />
        <DeltaText value="0" accessibilityLabel="Sin cambio" />
      </>,
    );
    expect(screen.getByText('▲ +2,4 %')).toHaveProp('accessibilityLabel', '+2,4 %');
    expect(screen.getByText(`▼ ${MINUS}1.0%`)).toBeOnTheScreen();
    expect(screen.getByLabelText('Sin cambio')).toHaveTextContent('0,0 %');
  });
});
