# Gravyx Ascenda

**Tu ascenso comienza aquí.** Una sola app con cinco módulos: Gastos, Bolsa, Patrimonio, Agenda y Hábitos y
Metas. Web PWA y Android primero; iOS al final.

- Plan completo: [`docs/plan-desarrollo.md`](docs/plan-desarrollo.md)
- Design system: [`docs/design-system.md`](docs/design-system.md)
- Decisiones: [`docs/adr/`](docs/adr/README.md)
- Flujo de cada fase (qué hace cada capa y quién la consume): [`docs/flujo/`](docs/flujo/README.md)
- Pendientes: [`docs/todo/`](docs/todo/pendientes.md)

## Estructura

```
apps/
  client/   Expo SDK 58 (web, Android, iOS) · Feature-Sliced Design
  api/      NestJS 12 (ESM) · monolito modular + Clean Architecture
  ml/       FastAPI + uv (Python 3.14) · servicio interno
packages/
  config/     tsconfig, ESLint y Vitest compartidos
  contracts/  esquemas zod: la única fuente de verdad de los datos
  finance/    matemática financiera pura (decimal.js)
  utils/      ids UUIDv7 y fechas
tools/        autoprueba de los linters de arquitectura
```

## Requisitos

| Herramienta | Versión                       | Cómo                                                              |
| ----------- | ----------------------------- | ----------------------------------------------------------------- |
| Node        | 24.21.0 (ver `.node-version`) | [fnm](https://github.com/Schniz/fnm): `winget install Schniz.fnm` |
| pnpm        | 12.11.2                       | `npm i -g pnpm@12.11.2`                                           |
| uv          | 0.10.x                        | <https://docs.astral.sh/uv/> (instala Python 3.14 solo)           |
| Android     | SDK + JDK 17                  | Solo para el dev build de Android                                 |

## Primeros pasos

```sh
pnpm install          # instala todo con las reglas de seguridad (ADR 0006)
pnpm build            # compila los paquetes internos y el cliente web
cp apps/api/.env.example apps/api/.env
cp apps/client/.env.example apps/client/.env
pnpm dev              # client web :8081 · api :3000 · ml :8000
```

- Web: <http://localhost:8081>
- API: <http://localhost:3000/health>
- ML: <http://localhost:8000/health>

### Android (dev build)

Con un emulador abierto o un teléfono conectado:

```sh
pnpm --filter @repo/client android    # expo run:android
```

Conviene que `ANDROID_HOME` use las mismas mayúsculas que la carpeta real (por ejemplo
`C:\develop\Android\Sdk`, no `...\sdk`). Windows no distingue mayúsculas, pero algunas herramientas
nativas comparan rutas como texto.

La carpeta `apps/client/android/` se genera sola (Continuous Native Generation) y no se versiona.
La configuración nativa vive en `apps/client/app.config.ts`.

## Comandos

| Comando              | Qué hace                                                               |
| -------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`           | Levanta client (web), api, ml y los paquetes en modo watch.            |
| `pnpm build`         | Compila todo.                                                          |
| `pnpm lint`          | ESLint (TypeScript) y Ruff (Python).                                   |
| `pnpm typecheck`     | `tsc --noEmit` y mypy.                                                 |
| `pnpm arch`          | Linters de arquitectura: Steiger (cliente) y dependency-cruiser (api). |
| `pnpm test`          | Pruebas rápidas, sin cobertura.                                        |
| `pnpm test:coverage` | Pruebas con mínimos de cobertura (lo que corre el CI).                 |
| `pnpm arch:selftest` | Verifica que los linters de arquitectura bloquean imports prohibidos.  |
| `pnpm format`        | Prettier sobre todo el repo.                                           |
| `pnpm check`         | Todo lo anterior + `pnpm audit`. Córrelo antes de abrir un PR.         |

Para una sola app: `pnpm --filter @repo/api test`, `pnpm --filter @repo/client lint`, etc.

## Reglas del proyecto

- **Por fases.** Una fase no se cierra hasta cumplir su criterio de salida con todo en verde.
- **Idioma (ADR 0011).** Los **comentarios** del código van en **español**. Todo lo demás del código va
  en **inglés**: nombres, archivos, rutas, códigos y mensajes de error, logs, nombres de pruebas y
  commits. Docs y ADRs en español. Los textos de la UI salen de `@repo/i18n` (desde F1) en español e
  inglés.
- **Flujo documentado.** Cada fase actualiza su `docs/flujo/FX.md`, y cada `index.ts` público lleva
  una cabecera en español que dice qué es y quién lo consume.
- **Contract-first.** Todo dato que cruza cliente ↔ api se valida con `@repo/contracts`.
- **Nunca `number` para dinero.** Se usa `@repo/finance` (decimal.js).
- **Capas.** Cliente con FSD y api con Clean Architecture; los linters bloquean imports prohibidos
  (ADR 0009).
- **Commits** con Conventional Commits en inglés; los hooks de Husky los revisan (ADR 0007).
- **Dependencias nuevas** esperan 7 días desde su publicación y no corren scripts de instalación sin
  permiso explícito (ADR 0006).
