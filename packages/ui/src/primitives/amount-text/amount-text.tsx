import { createContext, use, useMemo, type ReactNode } from 'react';

import {
  CURRENCY_DECIMALS,
  deltaDirection,
  formatAmount,
  formatPercent,
  maskedAmount,
  type AmountCurrency,
  type NumberLocale,
  type SignDisplay,
} from '../../lib/format-number';
import { useCountUp } from '../../motion/use-count-up';
import { Text, type TextProps, type TextTone } from '../text/text';

interface AmountPrivacy {
  hidden: boolean;
  /** Lo que lee el lector de pantalla en lugar del monto ("Monto oculto"). */
  hiddenLabel: string;
}

const AmountPrivacyContext = createContext<AmountPrivacy>({ hidden: false, hiddenLabel: '' });

/**
 * Modo privado: con `hidden`, todos los AmountText de adentro muestran `•••` (§10: "oculta todos
 * los montos de la pantalla"). La app lo monta en la raíz con la preferencia del usuario (F2).
 */
export function AmountPrivacyProvider({
  hidden,
  hiddenLabel,
  children,
}: AmountPrivacy & { children: ReactNode }) {
  const value = useMemo(() => ({ hidden, hiddenLabel }), [hidden, hiddenLabel]);
  return <AmountPrivacyContext value={value}>{children}</AmountPrivacyContext>;
}

/** `true` si el modo privado está activo. */
export function useAmountPrivacy(): boolean {
  return use(AmountPrivacyContext).hidden;
}

const SIGN_TONE: Record<ReturnType<typeof deltaDirection>, TextTone> = {
  up: 'gain',
  down: 'loss',
  flat: 'default',
};

export interface AmountTextProps extends Omit<TextProps, 'children'> {
  /** Monto como texto decimal, ya redondeado para mostrar (`roundForDisplay` de @repo/finance). */
  value: string;
  currency: AmountCurrency;
  locale?: NumberLocale;
  signDisplay?: SignDisplay;
  /** Verde si es positivo y rojo si es negativo (el signo siempre acompaña al color). */
  colorBySign?: boolean;
  /** Cuenta hasta el valor (M03). Solo para la cifra protagonista de la pantalla. */
  animate?: boolean;
  /** Fuerza el modo privado para este monto (por defecto, el del provider). */
  hidden?: boolean;
}

/**
 * P28 · AmountText: monto con moneda, signo y cifras tabulares (`num.m` por defecto). En modo
 * privado muestra `$ •••` y el lector de pantalla dice el texto de `hiddenLabel`.
 */
export function AmountText({
  value,
  currency,
  locale = 'es-CO',
  signDisplay = 'auto',
  colorBySign = false,
  animate = false,
  hidden,
  variant = 'numM',
  tone,
  ...rest
}: AmountTextProps) {
  const privacy = use(AmountPrivacyContext);
  const isHidden = hidden ?? privacy.hidden;
  const resolvedTone =
    tone ?? (colorBySign && !isHidden ? SIGN_TONE[deltaDirection(value)] : 'default');

  if (isHidden) {
    return (
      <Text
        variant={variant}
        tone={resolvedTone}
        accessibilityLabel={privacy.hiddenLabel || undefined}
        {...rest}
      >
        {maskedAmount(currency)}
      </Text>
    );
  }

  const format = { currency, locale, signDisplay };
  return (
    <Text variant={variant} tone={resolvedTone} {...rest}>
      {animate ? <CountingAmount value={value} format={format} /> : formatAmount(value, format)}
    </Text>
  );
}

function CountingAmount({
  value,
  format,
}: {
  value: string;
  format: { currency: AmountCurrency; locale: NumberLocale; signDisplay: SignDisplay };
}) {
  const target = Number(value);
  const shown = useCountUp(target);
  // Al terminar se muestra el texto original: el número intermedio pierde precisión en cifras grandes.
  return shown === target
    ? formatAmount(value, format)
    : formatAmount(shown.toFixed(CURRENCY_DECIMALS[format.currency]), format);
}

export interface DeltaTextProps extends Omit<TextProps, 'children'> {
  /** Variación en porcentaje como texto decimal (`2.4` = 2,4 %). */
  value: string;
  locale?: NumberLocale;
  decimals?: number;
}

/**
 * P29 · DeltaText: `▲ +2,4 %` / `▼ −1,0 %` en `gain` o `loss`. La flecha y el signo acompañan al
 * color (§2.1). El lector de pantalla lee el número sin las flechas.
 */
export function DeltaText({
  value,
  locale = 'es-CO',
  decimals = 1,
  variant = 'label',
  tone,
  accessibilityLabel,
  ...rest
}: DeltaTextProps) {
  const text = formatPercent(value, { locale, decimals });
  const direction = deltaDirection(value);
  return (
    <Text
      variant={variant}
      tone={tone ?? (direction === 'flat' ? 'muted' : SIGN_TONE[direction])}
      accessibilityLabel={accessibilityLabel ?? text.replace(/^[▲▼] /, '')}
      {...rest}
    >
      {text}
    </Text>
  );
}
