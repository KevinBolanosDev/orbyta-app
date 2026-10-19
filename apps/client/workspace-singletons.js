// Una sola copia de cada dependencia del cliente en el bundle y en Jest (ADR 0019).
// pnpm puede instalar dos copias de react-native, Unistyles, Reanimated… (una para el cliente y otra
// para las devDependencies de @repo/ui) y esos módulos solo funcionan con una instancia. Cuando un
// archivo de packages/ importa una dependencia del cliente, se resuelve desde apps/client.
// Además, los módulos con un runtime global (worklets, Reanimated, gesture-handler, Unistyles,
// Nitro) se resuelven desde apps/client también cuando los pide otra dependencia: pnpm no le da a
// gesture-handler su propio react-native-worklets y Node lo encontraba en la carpeta compartida de
// .pnpm, que es otra copia (dos runtimes de worklets: los gestos de la hoja inferior fallaban).
// Lo usan: metro.config.js y jest.resolver.js.
const path = require('node:path');

const { dependencies } = require('./package.json');

const projectRoot = __dirname;
const isWindows = process.platform === 'win32';
const normalize = (filePath) => {
  const normalized = path.normalize(filePath);
  return isWindows ? normalized.toLowerCase() : normalized;
};

const workspacePackagesDir = normalize(path.join(projectRoot, '..', '..', 'packages') + path.sep);

const appDependencies = new Set(
  Object.keys(dependencies).filter((name) => !name.startsWith('@repo/')),
);

/** Siempre una sola instancia, la del cliente, venga de donde venga el import. */
const RUNTIME_SINGLETONS = new Set([
  'react-native-gesture-handler',
  'react-native-nitro-modules',
  'react-native-reanimated',
  'react-native-unistyles',
  'react-native-worklets',
]);

/** `react-native/Libraries/x` → `react-native`; `@scope/pkg/sub` → `@scope/pkg`. */
function packageNameOf(request) {
  const parts = request.split('/');
  return request.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** ¿Este import debe resolverse desde apps/client en lugar de desde el archivo que lo pide? */
function shouldResolveFromApp(originPath, request) {
  if (request.startsWith('.') || path.isAbsolute(request)) return false;
  const name = packageNameOf(request);
  if (!appDependencies.has(name)) return false;
  return RUNTIME_SINGLETONS.has(name) || normalize(originPath).startsWith(workspacePackagesDir);
}

module.exports = { projectRoot, RUNTIME_SINGLETONS, shouldResolveFromApp };
