## Qué cambia

<!-- Una o dos líneas. Fase y entregable del plan (ej. "F2 · module-switcher"). -->

## Cómo lo probé

<!-- Comandos que corriste y en qué plataforma (web, Android). -->

## Checklist

- [ ] `pnpm check` pasa en local (formato, lint, tipos, arquitectura, pruebas con cobertura, audit).
- [ ] Probé en la **PWA** y, si toca UI o nativo, en **Android**.
- [ ] Comentarios en español; nombres, rutas, errores, logs y nombres de pruebas en inglés (ADR 0011).
- [ ] Actualicé `docs/flujo/FX.md` y la cabecera de cada `index.ts` público nuevo o cambiado.
- [ ] Los textos que ve el usuario salen de `@repo/i18n` en español e inglés (desde F1).
- [ ] Respeta FSD en el cliente y las capas en el api (los linters pasan sin desactivar reglas).
- [ ] Los datos que cruzan cliente ↔ api usan esquemas de `@repo/contracts`.
- [ ] Nada de dinero con `number`: se usa `@repo/finance`.
- [ ] Sin secretos ni `.env` en el commit.
- [ ] ¿Dejaste `TODO(ios)`? Agrégalo también a `docs/todo/ios.md`.
- [ ] ¿Dejaste otros `TODO(...)`? Agrégalos a `docs/todo/pendientes.md`.
- [ ] Si tomaste una decisión de librería o patrón, hay un ADR en `docs/adr/`.
- [ ] Dependencias nuevas: revisé quién la mantiene, si pide scripts de instalación y por qué hace falta.
