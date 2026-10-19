import type { TranslationResource } from '../types.js';

// Textos en inglés. El tipo `TranslationResource` obliga a tener las mismas claves que `es.ts`.
export const en: TranslationResource = {
  brand: {
    name: 'Gravyx Ascenda',
    tagline: 'Your ascent begins here.',
  },
  modules: {
    hub: 'Home',
    expenses: 'Expenses',
    stocks: 'Stocks',
    wealth: 'Wealth',
    agenda: 'Agenda',
    habits: 'Habits & Goals',
  },
  preferences: {
    theme: {
      label: 'Theme',
      system: 'System',
      light: 'Light',
      dark: 'Dark',
    },
    language: {
      label: 'Language',
      es: 'Español',
      en: 'English',
    },
  },
  catalog: {
    title: 'UI catalog',
    subtitle: 'Cristal Aurora · tokens and components',
    breakpoint: 'Current breakpoint: {{name}}',
    sections: {
      colors: 'Semantic colors',
      categories: 'Categories and series',
      modules: 'Module colors',
      holo: 'Holographic gradient',
      typography: 'Typography',
      spacing: 'Spacing',
      radius: 'Radii',
      elevation: 'Elevation',
      glass: 'Glass and aurora',
      motion: 'Motion',
    },
    controls: {
      motion: {
        label: 'Motion',
        system: 'System',
        reduced: 'Reduced',
      },
      transparency: {
        label: 'Transparency',
        system: 'System',
        reduced: 'Reduced',
      },
      aurora: {
        label: 'Aurora',
        full: 'Full',
        dimmed: 'Dimmed',
      },
      replay: 'Replay animations',
    },
    glass: {
      chrome: 'glass.chrome · header and bars',
      card: 'glass.card · hero card with HUD and sheen',
      sheet: 'glass.sheet · sheets and dialogs',
    },
    motion: {
      enter: 'M01 · Enter',
      press: 'M02 · Press (tap me)',
      countUp: 'M03 · Number count-up',
      draw: 'M04 · Line draw',
      progress: 'M05 · Progress fill',
      sheen: 'M08 · Holographic sheen',
    },
    samples: {
      heading: 'Net worth',
      body: 'Numbers first: amounts, changes and dates are read before any decoration.',
    },
  },
};
