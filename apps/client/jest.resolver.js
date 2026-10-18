// Resolver de Jest del cliente. Encadena, en este orden:
// 1. Copia única de las dependencias del cliente cuando las importa un paquete del monorepo (ADR 0019).
// 2. El resolver de Reanimated/worklets (usa sus implementaciones de JS en Jest).
// 3. El resolver del preset jest-expo (el de React Native), que este archivo reemplaza.
const reanimatedResolver = require('react-native-reanimated/jest/resolver');
const presetResolver = require(require('jest-expo/jest-preset').resolver);

const { projectRoot, shouldResolveFromApp } = require('./workspace-singletons');

/** @type {import('jest-resolve').SyncResolver} */
module.exports = (request, options) => {
  const target = shouldResolveFromApp(options.basedir, request)
    ? { ...options, basedir: projectRoot }
    : options;
  return reanimatedResolver(request, {
    ...target,
    defaultResolver: (nextRequest, nextOptions) =>
      presetResolver(nextRequest, { ...nextOptions, defaultResolver: options.defaultResolver }),
  });
};
