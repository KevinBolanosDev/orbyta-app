// Babel solo para las pruebas de @repo/ui (jest-expo). En la app, Metro usa la config del cliente.
// El plugin de Unistyles no hace falta aquí: en Jest se usan sus mocks (ADR 0012).
module.exports = function config(api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
