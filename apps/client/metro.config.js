// Config de Metro (bundler de Expo). La leen `expo start`, `expo run:android` y `expo export`.
// Expo ya configura el monorepo (watchFolders y node_modules de la raíz); aquí solo se fuerza una
// copia única de las dependencias del cliente cuando las importa un paquete del monorepo (ADR 0019).
const path = require('node:path');

const { getDefaultConfig } = require('expo/metro-config');

const { projectRoot, shouldResolveFromApp } = require('./workspace-singletons');

const config = getDefaultConfig(projectRoot);
const appOrigin = path.join(projectRoot, 'package.json');
const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstreamResolveRequest ?? context.resolveRequest;
  if (shouldResolveFromApp(context.originModulePath, moduleName)) {
    return resolve({ ...context, originModulePath: appOrigin }, moduleName, platform);
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
