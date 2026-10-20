import { composite, contrastRatio, parseColor, toHex, WCAG_AA, withAlpha } from '../lib/color';

import { categoryColors, holoGradient, semanticColors, type ColorScheme } from './color';
import { glass } from './surface';

// Contraste AA de la paleta (design-system.md §1 principio 1, §2.1, §2.2 y §10). La superficie de
// referencia es la tarjeta de vidrio sin desenfoque sobre el fondo (el caso más común de la UI).

const SCHEMES: ColorScheme[] = ['dark', 'light'];

/** Color opaco de una tarjeta de vidrio (`glass.card.fill`) pintada sobre `bg`. */
function cardSurface(scheme: ColorScheme): string {
  const bg = parseColor(semanticColors[scheme].bg);
  return toHex(composite(parseColor(glass[scheme].card.fill), bg));
}

const TEXT_ROLES = ['ink', 'inkMuted', 'primary', 'secondary', 'gain', 'loss', 'warning'] as const;

describe.each(SCHEMES)('%s theme', (scheme) => {
  const colors = semanticColors[scheme];
  const surfaces = { bg: colors.bg, card: cardSurface(scheme) };

  const cases = TEXT_ROLES.flatMap((role) =>
    (['bg', 'card'] as const).map((surface) => [role, surface] as const),
  );

  it.each(cases)('%s reaches AA as text on %s', (role, surface) => {
    expect(contrastRatio(colors[role], surfaces[surface])).toBeGreaterThanOrEqual(WCAG_AA.text);
  });

  it('accent reaches the non-text minimum on a glass card (icons, badges, large text)', () => {
    expect(contrastRatio(colors.accent, surfaces.card)).toBeGreaterThanOrEqual(WCAG_AA.nonText);
  });

  it('onPrimary reaches AA on primary', () => {
    expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(WCAG_AA.text);
  });

  it('every category color works as a chart fill on a glass card (≥ 3:1)', () => {
    for (const category of categoryColors[scheme]) {
      expect(contrastRatio(category, surfaces.card)).toBeGreaterThanOrEqual(WCAG_AA.nonText);
    }
  });
});

describe('holographic gradient', () => {
  it('keeps its ink readable on every stop', () => {
    for (const stop of holoGradient.stops) {
      expect(contrastRatio(holoGradient.ink, stop.color)).toBeGreaterThanOrEqual(WCAG_AA.text);
    }
  });
});

describe('text on glass over the aurora (F1.9 audit)', () => {
  // Fondo de referencia detrás de una tarjeta: un orbe y una cortina a media intensidad (la zona
  // típica, a mitad del degradado de cada uno), tal como se midió en el emulador.
  const aurora = (scheme: ColorScheme) => {
    const c = semanticColors[scheme];
    const orbs = ['orb1', 'orb2', 'orb3'] as const;
    const ribbons = [
      ['primary', scheme === 'dark' ? 0.4 : 0.2],
      ['gain', scheme === 'dark' ? 0.3 : 0.16],
      ['accent', scheme === 'dark' ? 0.34 : 0.18],
    ] as const;
    return orbs.flatMap((orb) =>
      ribbons.map(([ribbon, alpha]) => {
        const orbColor = parseColor(c[orb]);
        let under = composite({ ...orbColor, a: orbColor.a * 0.6 }, parseColor(c.bg));
        under = composite(parseColor(withAlpha(c[ribbon], alpha * 0.45)), under);
        return toHex(composite(parseColor(glass[scheme].card.fill), under));
      }),
    );
  };

  it.each(SCHEMES)('keeps ink and inkMuted at AA on a %s glass card', (scheme) => {
    const colors = semanticColors[scheme];
    for (const surface of aurora(scheme)) {
      expect(contrastRatio(colors.ink, surface)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(colors.inkMuted, surface)).toBeGreaterThanOrEqual(WCAG_AA.text);
    }
  });
});
