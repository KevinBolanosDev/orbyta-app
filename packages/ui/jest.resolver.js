// Resolver de Jest de @repo/ui. Encadena el de Reanimated/worklets (en Jest usa sus implementaciones
// de JS, no los archivos `.native` que buscan el módulo nativo) y el del preset jest-expo, que este
// archivo reemplaza. El cliente hace lo mismo en su propio jest.resolver.js.
//
// Copia única de los runtimes (ADR 0019): worklets, Reanimated, gesture-handler, Unistyles y Nitro se
// resuelven siempre desde @repo/ui, también cuando los pide otra dependencia. pnpm no le da a
// gesture-handler su propio worklets y Node encontraba otra copia en la carpeta compartida de .pnpm
// (dos runtimes: el mock de worklets de jest.setup.ts no le llegaba).
const reanimatedResolver = require('react-native-reanimated/jest/resolver');
const presetResolver = require(require('jest-expo/jest-preset').resolver);

const RUNTIME_SINGLETONS = new Set([
  'react-native-gesture-handler',
  'react-native-nitro-modules',
  'react-native-reanimated',
  'react-native-unistyles',
  'react-native-worklets',
]);

/** `react-native-worklets/lib/x` → `react-native-worklets`; `@scope/pkg/sub` → `@scope/pkg`. */
function packageNameOf(request) {
  const parts = request.split('/');
  return request.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** @type {import('jest-resolve').SyncResolver} */
module.exports = (request, options) => {
  const singleton =
    !request.startsWith('.') && RUNTIME_SINGLETONS.has(packageNameOf(request ?? ''));
  const target = singleton ? { ...options, basedir: __dirname } : options;
  return reanimatedResolver(request, {
    ...target,
    defaultResolver: (nextRequest, nextOptions) =>
      presetResolver(nextRequest, { ...nextOptions, defaultResolver: options.defaultResolver }),
  });
};
