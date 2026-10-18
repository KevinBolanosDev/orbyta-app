// Reglas de arquitectura del API (plan §4.3). `pnpm arch` rompe el build ante cualquier violación.
// Capas: presentation → application → domain ← infrastructure. Los módulos solo se hablan por index.ts.

const LAYER = '^src/(?:modules/[^/]+|shared)';
const NOT_TESTS = ['\\.spec\\.ts$', '\\.e2e-spec\\.ts$'];

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Las dependencias circulares hacen imposible razonar sobre las capas.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment:
        'domain/ es TypeScript puro: sin Nest, sin HTTP, sin ORM. Solo paquetes puros de la lista ' +
        'blanca (los paquetes del workspace se resuelven a packages/*, fuera de node_modules).',
      from: { path: `${LAYER}/domain/`, pathNot: NOT_TESTS },
      to: {
        path: '(^|/)node_modules/',
        pathNot: 'node_modules/(?:zod|decimal\\.js)/',
      },
    },
    {
      name: 'domain-not-to-outer-layers',
      severity: 'error',
      from: { path: `${LAYER}/domain/`, pathNot: NOT_TESTS },
      to: { path: `${LAYER}/(?:application|infrastructure|presentation)/` },
    },
    {
      name: 'domain-no-node-builtins',
      severity: 'error',
      from: { path: `${LAYER}/domain/`, pathNot: NOT_TESTS },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'application-not-to-outer-layers',
      severity: 'error',
      comment: 'application/ define puertos; nunca conoce adaptadores ni controladores.',
      from: { path: `${LAYER}/application/`, pathNot: NOT_TESTS },
      to: { path: `${LAYER}/(?:infrastructure|presentation)/` },
    },
    {
      name: 'infrastructure-not-to-presentation',
      severity: 'error',
      from: { path: `${LAYER}/infrastructure/`, pathNot: NOT_TESTS },
      to: { path: '^src/modules/[^/]+/presentation/' },
    },
    {
      name: 'modules-only-through-public-api',
      severity: 'error',
      comment: 'Un módulo solo importa a otro por su index.ts (plan §4.3, regla 2).',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/[^/]+/',
        pathNot: ['^src/modules/$1/', '^src/modules/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'shared-kernel-has-no-business',
      severity: 'error',
      comment: 'shared/ no puede depender de ningún módulo de negocio.',
      from: { path: '^src/shared/' },
      to: { path: '^src/modules/' },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment: 'El código de producción no puede importar devDependencies.',
      from: { path: '^src/', pathNot: NOT_TESTS },
      to: { dependencyTypes: ['npm-dev'], dependencyTypesNot: ['type-only'] },
    },
  ],
  options: {
    doNotFollow: { path: ['node_modules'] },
    exclude: { path: ['^dist/', '^coverage/'] },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.js', '.json'],
    },
    reporterOptions: { text: { highlightFocused: true } },
  },
};
