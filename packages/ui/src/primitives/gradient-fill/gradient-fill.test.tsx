import { render, screen } from '@testing-library/react-native';

import { holoGradient } from '../../tokens';

import { GradientFill } from './gradient-fill';

describe('GradientFill', () => {
  it('renders a decorative layer hidden from screen readers and touches', async () => {
    await render(<GradientFill gradient={holoGradient} testID="holo" />);
    const layer = screen.getByTestId('holo', { includeHiddenElements: true });
    expect(layer.props).toMatchObject({
      pointerEvents: 'none',
      importantForAccessibility: 'no-hide-descendants',
    });
  });
});
