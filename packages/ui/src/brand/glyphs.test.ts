import { __iconData as calendarDays } from 'lucide-react-native/icons/calendar-days';
import { __iconData as house } from 'lucide-react-native/icons/house';
import { __iconData as receiptText } from 'lucide-react-native/icons/receipt-text';
import { __iconData as target } from 'lucide-react-native/icons/target';
import { __iconData as trendingUp } from 'lucide-react-native/icons/trending-up';

import { MODULE_GLYPHS } from './glyphs';

interface IconData {
  node: readonly (readonly [string, Record<string, string>])[];
}

// Rectángulos y círculos de Lucide pasados a trazo, como los guarda MODULE_GLYPHS.
function toPath([tag, attrs]: readonly [string, Record<string, string>]): string {
  const n = (key: string) => Number(attrs[key]);
  if (tag === 'path') return attrs['d'] ?? '';
  if (tag === 'circle') {
    const [cx, cy, r] = [n('cx'), n('cy'), n('r')];
    return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0`;
  }
  if (tag === 'rect') {
    const [x, y, w, h, rx] = [n('x'), n('y'), n('width'), n('height'), n('rx')];
    return (
      `M${x + rx} ${y}h${w - 2 * rx}a${rx} ${rx} 0 0 1 ${rx} ${rx}v${h - 2 * rx}` +
      `a${rx} ${rx} 0 0 1-${rx} ${rx}H${x + rx}a${rx} ${rx} 0 0 1-${rx}-${rx}V${y + rx}` +
      `a${rx} ${rx} 0 0 1 ${rx}-${rx}z`
    );
  }
  throw new Error(`Unexpected Lucide element ${tag}`);
}

describe('MODULE_GLYPHS', () => {
  it.each([
    ['expenses', receiptText],
    ['stocks', trendingUp],
    ['wealth', house],
    ['agenda', calendarDays],
    ['habits', target],
  ] as const)('matches the installed Lucide glyph for %s (ADR 0015)', (moduleId, data) => {
    expect(MODULE_GLYPHS[moduleId]).toEqual((data as unknown as IconData).node.map(toPath));
  });
});
