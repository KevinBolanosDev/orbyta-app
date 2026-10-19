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
      glass: 'Vidrio y aurora',
      motion: 'Movimiento',
    },
    controls: {
      motion: {
        label: 'Movimiento',
        system: 'Sistema',
        reduced: 'Reducido',
      },
      transparency: {
        label: 'Transparencia',
        system: 'Sistema',
        reduced: 'Reducida',
      },
      aurora: {
        label: 'Aurora',
        full: 'Completa',
        dimmed: 'Atenuada',
      },
      replay: 'Repetir animaciones',
    },
    glass: {
      chrome: 'glass.chrome · encabezado y barra',
      card: 'glass.card · tarjeta héroe con HUD y reflejo',
      sheet: 'glass.sheet · hojas y diálogos',
    },
    motion: {
      enter: 'M01 · Entrada',
      press: 'M02 · Presión (tócame)',
      countUp: 'M03 · Conteo de cifras',
      draw: 'M04 · Dibujo de línea',
      progress: 'M05 · Relleno de progreso',
      sheen: 'M08 · Reflejo holográfico',
    },
    samples: {
      heading: 'Patrimonio neto',
      body: 'Las cifras primero: montos, variaciones y fechas se leen antes que la decoración.',
    },
  },
} as const;
