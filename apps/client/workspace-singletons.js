// Una sola copia de cada dependencia del cliente en el bundle y en Jest (ADR 0019).
// pnpm puede instalar dos copias de react-native, Unistyles, Reanimated… (una para el cliente y otra
// para las devDependencies de @repo/ui) y esos módulos solo funcionan con una instancia. Cuando un
// archivo de packages/ importa una dependencia del cliente, se resuelve desde apps/client.
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

/** `react-native/Libraries/x` → `react-native`; `@scope/pkg/sub` → `@scope/pkg`. */
function packageNameOf(request) {
  const parts = request.split('/');
  return request.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** ¿Este import debe resolverse desde apps/client en lugar de desde el archivo que lo pide? */
function shouldResolveFromApp(originPath, request) {
  if (request.startsWith('.') || path.isAbsolute(request)) return false;
  return (
    normalize(originPath).startsWith(workspacePackagesDir) &&
    appDependencies.has(packageNameOf(request))
  );
}

module.exports = { projectRoot, shouldResolveFromApp };
