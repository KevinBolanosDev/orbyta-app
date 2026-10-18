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
      glass: 'Glass levels',
      motion: 'Motion',
    },
    samples: {
      heading: 'Net worth',
      body: 'Numbers first: amounts, changes and dates are read before any decoration.',
    },
  },
};
