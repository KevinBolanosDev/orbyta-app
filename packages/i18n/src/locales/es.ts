// Textos en español: idioma por defecto y fuente de verdad de las claves (plan §16).
// Las claves van en inglés; `en.ts` debe tener exactamente las mismas (lo revisa el tipo y la prueba).
export const es = {
  brand: {
    name: 'Gravyx Ascenda',
    tagline: 'Tu ascenso comienza aquí.',
  },
  modules: {
    hub: 'Inicio',
    expenses: 'Gastos',
    stocks: 'Bolsa',
    wealth: 'Patrimonio',
    agenda: 'Agenda',
    habits: 'Hábitos y Metas',
  },
  preferences: {
    theme: {
      label: 'Tema',
      system: 'Sistema',
      light: 'Claro',
      dark: 'Oscuro',
    },
    language: {
      label: 'Idioma',
      es: 'Español',
      en: 'English',
    },
  },
  catalog: {
    title: 'Catálogo de UI',
    subtitle: 'Cristal Aurora · tokens y componentes',
    breakpoint: 'Breakpoint actual: {{name}}',
    sections: {
      colors: 'Colores semánticos',
      categories: 'Categorías y series',
      modules: 'Colores de módulo',
      holo: 'Degradado holográfico',
      typography: 'Tipografía',
      spacing: 'Espaciado',
      radius: 'Radios',
      elevation: 'Elevación',
      glass: 'Niveles de vidrio',
      motion: 'Movimiento',
    },
    samples: {
      heading: 'Patrimonio neto',
      body: 'Las cifras primero: montos, variaciones y fechas se leen antes que la decoración.',
    },
  },
} as const;
