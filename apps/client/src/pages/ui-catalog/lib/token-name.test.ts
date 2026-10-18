import { toTokenName } from './token-name';

describe('toTokenName', () => {
  it.each([
    ['ink', 'ink'],
    ['inkMuted', 'ink.muted'],
    ['onPrimary', 'on.primary'],
    ['orb1', 'orb.1'],
    ['displayXl', 'display.xl'],
    ['mono400', 'mono.400'],
  ])('%s → %s', (key, expected) => {
    expect(toTokenName(key)).toBe(expected);
  });
});
