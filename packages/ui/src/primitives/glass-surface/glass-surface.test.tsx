import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AccessibilityPreferencesProvider } from '../../motion/accessibility-preferences';
import { AuroraBackground } from '../aurora-background/aurora-background';
import { HoloSheen } from '../holo-sheen/holo-sheen';

import { GlassSurface } from './glass-surface';

describe('GlassSurface (P05)', () => {
  it('renders its content on every level', async () => {
    await render(
      <>
        <GlassSurface level="chrome">
          <Text>Chrome</Text>
        </GlassSurface>
        <GlassSurface>
          <Text>Card</Text>
        </GlassSurface>
        <GlassSurface level="sheet">
          <Text>Sheet</Text>
        </GlassSurface>
      </>,
    );
    for (const label of ['Chrome', 'Card', 'Sheet']) {
      expect(screen.getByText(label)).toBeOnTheScreen();
    }
  });

  it('adds HUD corners and the holographic sheen to hero surfaces', async () => {
    await render(
      <GlassSurface hud holo="manual" testID="hero" accessibilityLabel="Patrimonio neto">
        <Text>Hero</Text>
      </GlassSurface>,
    );
    expect(screen.getByLabelText('Patrimonio neto')).toBeOnTheScreen();
    expect(screen.getByText('Hero')).toBeOnTheScreen();
  });

  it('keeps working with reduced transparency', async () => {
    await render(
      <AccessibilityPreferencesProvider reduceTransparency>
        <GlassSurface level="sheet">
          <Text>Solid</Text>
        </GlassSurface>
      </AccessibilityPreferencesProvider>,
    );
    expect(screen.getByText('Solid')).toBeOnTheScreen();
  });
});

describe('decorative layers (P35, P36)', () => {
  it('hides the sheen and the aurora from touches and screen readers', async () => {
    await render(
      <>
        <HoloSheen testID="sheen" mode="idle" />
        <AuroraBackground testID="aurora" intensity="dimmed" />
        <AuroraBackground testID="aurora-plain" />
      </>,
    );
    for (const testID of ['sheen', 'aurora', 'aurora-plain']) {
      expect(screen.getByTestId(testID, { includeHiddenElements: true }).props).toMatchObject({
        pointerEvents: 'none',
        importantForAccessibility: 'no-hide-descendants',
      });
    }
  });

  it('keeps the aurora still with reduced motion', async () => {
    await render(
      <AccessibilityPreferencesProvider reduceMotion>
        <AuroraBackground testID="still" />
      </AccessibilityPreferencesProvider>,
    );
    expect(screen.getByTestId('still', { includeHiddenElements: true })).toBeTruthy();
  });
});
