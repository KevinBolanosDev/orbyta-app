// Config de Babel del cliente. La usan Metro (app) y Jest (pruebas), también para el código fuente de
// @repo/ui, que no tiene build propio (ADR 0019). babel-preset-expo suma solo el plugin de worklets.
module.exports = function config(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Unistyles (ADR 0012): procesa src/ y los componentes de @repo/ui. En Jest se apaga solo.
      ['react-native-unistyles/plugin', { root: 'src', autoProcessPaths: ['packages/ui/src'] }],
    ],
  };
};
