// Conventional Commits (ADR 0007). Mensajes en inglés, ej. `feat(client): add module switcher`.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'client',
        'api',
        'ml',
        'contracts',
        'finance',
        'utils',
        'config',
        'ui',
        'i18n',
        'ci',
        'deps',
        'docs',
        'repo',
      ],
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'body-max-line-length': [1, 'always', 100],
  },
};
