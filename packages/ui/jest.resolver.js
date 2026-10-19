// Resolver de Jest de @repo/ui. Encadena el de Reanimated/worklets (en Jest usa sus implementaciones
// de JS, no los archivos `.native` que buscan el módulo nativo) y el del preset jest-expo, que este
// archivo reemplaza. El cliente hace lo mismo en su propio jest.resolver.js.
const reanimatedResolver = require('react-native-reanimated/jest/resolver');
const presetResolver = require(require('jest-expo/jest-preset').resolver);

/** @type {import('jest-resolve').SyncResolver} */
module.exports = (request, options) =>
  reanimatedResolver(request, {
    ...options,
    defaultResolver: (nextRequest, nextOptions) =>
      presetResolver(nextRequest, { ...nextOptions, defaultResolver: options.defaultResolver }),
  });
