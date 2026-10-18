// Tipografía (design-system.md §2.3 y §11.1). Los nombres de familia son los que registra expo-font
// (un nombre por peso: en Android el peso sale del archivo, no de `fontWeight`).

export const fontFamily = {
  display600: 'ChakraPetch_600SemiBold',
  display700: 'ChakraPetch_700Bold',
  body400: 'DMSans_400Regular',
  body500: 'DMSans_500Medium',
  body600: 'DMSans_600SemiBold',
  body700: 'DMSans_700Bold',
  mono400: 'JetBrainsMono_400Regular',
  mono500: 'JetBrainsMono_500Medium',
  mono700: 'JetBrainsMono_700Bold',
  /** Solo el wordmark "GRAVYX" (`type.brand`), nunca texto de la UI. */
  brand: 'Michroma_400Regular',
  /** Solo "Ascenda" en la marca (Exo 2 weight 200). */
  brandThin: 'Exo2_200ExtraLight',
} as const;

export type FontFamilyToken = keyof typeof fontFamily;

export interface TypeMetrics {
  fontSize: number;
  lineHeight: number;
}

export interface TypeStyleToken {
  family: FontFamilyToken;
  /** Móvil (breakpoint `compact`). */
  compact: TypeMetrics;
  /** Tablet y web (`medium` y `expanded`). */
  wide: TypeMetrics;
  /** Tracking en em (se convierte a px con el tamaño). */
  letterSpacingEm?: number;
  uppercase?: boolean;
  /** Cifras tabulares, para que los números no "bailen" al animarse. */
  tabularNums?: boolean;
}

/** Escala mobile-first (`type.<rol>` del design system). */
export const typeScale = {
  /** Cifra héroe (patrimonio neto). */
  displayXl: {
    family: 'display700',
    compact: { fontSize: 40, lineHeight: 44 },
    wide: { fontSize: 56, lineHeight: 60 },
    tabularNums: true,
  },
  /** Título de pantalla grande. */
  displayL: {
    family: 'display700',
    compact: { fontSize: 32, lineHeight: 36 },
    wide: { fontSize: 40, lineHeight: 44 },
  },
  /** Título de pantalla. */
  titleL: {
    family: 'display600',
    compact: { fontSize: 24, lineHeight: 30 },
    wide: { fontSize: 28, lineHeight: 34 },
  },
  /** Título de tarjeta. */
  titleM: {
    family: 'display600',
    compact: { fontSize: 20, lineHeight: 26 },
    wide: { fontSize: 22, lineHeight: 28 },
  },
  /** Subtítulo y encabezado de lista. */
  titleS: {
    family: 'body600',
    compact: { fontSize: 17, lineHeight: 24 },
    wide: { fontSize: 18, lineHeight: 24 },
  },
  /** Texto principal. */
  bodyL: {
    family: 'body400',
    compact: { fontSize: 17, lineHeight: 24 },
    wide: { fontSize: 17, lineHeight: 26 },
  },
  /** Texto de listas y formularios. */
  bodyM: {
    family: 'body400',
    compact: { fontSize: 15, lineHeight: 22 },
    wide: { fontSize: 15, lineHeight: 22 },
  },
  /** Botones pequeños, chips y etiquetas. */
  label: {
    family: 'body600',
    compact: { fontSize: 13, lineHeight: 18 },
    wide: { fontSize: 13, lineHeight: 18 },
  },
  /** Metadatos y ayudas. */
  caption: {
    family: 'body500',
    compact: { fontSize: 12, lineHeight: 16 },
    wide: { fontSize: 12, lineHeight: 16 },
  },
  /** Etiquetas en mayúscula ("LOGRO DESBLOQUEADO"). */
  overline: {
    family: 'mono500',
    compact: { fontSize: 11, lineHeight: 14 },
    wide: { fontSize: 11, lineHeight: 14 },
    letterSpacingEm: 0.18,
    uppercase: true,
  },
  /** Montos en detalle. */
  numL: {
    family: 'mono500',
    compact: { fontSize: 22, lineHeight: 28 },
    wide: { fontSize: 24, lineHeight: 30 },
    tabularNums: true,
  },
  /** Montos en listas y tickers. */
  numM: {
    family: 'mono500',
    compact: { fontSize: 15, lineHeight: 20 },
    wide: { fontSize: 15, lineHeight: 20 },
    tabularNums: true,
  },
} as const satisfies Record<string, TypeStyleToken>;

export type TypeVariant = keyof typeof typeScale;

export const TYPE_VARIANTS = Object.keys(typeScale) as TypeVariant[];

/** Texto dinámico del sistema soportado hasta 1,3× (§2.3). */
export const MAX_FONT_SCALE = 1.3;
