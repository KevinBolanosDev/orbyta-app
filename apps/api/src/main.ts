// Punto de entrada del API: carga el entorno, crea la app Nest y escucha en PORT.
// Lo ejecutan: `pnpm dev` (nest start --watch) y `pnpm start` (node dist/main.js).
import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { loadEnvFile, parseEnv } from './config/env.js';

async function bootstrap(): Promise<void> {
  loadEnvFile();
  const env = parseEnv(process.env);

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: env.CORS_ORIGINS });
  app.enableShutdownHooks();

  await app.listen(env.PORT);
  Logger.log(`Gravyx Ascenda API listening on http://localhost:${env.PORT}`, 'Bootstrap');
}

await bootstrap();
