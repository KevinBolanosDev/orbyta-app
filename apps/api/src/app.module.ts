// Módulo raíz: une el kernel compartido (shared/infrastructure) con los módulos de negocio.
// Lo consume: main.ts y las pruebas e2e. Cada fase B agrega aquí su módulo.
import { Module } from '@nestjs/common';

import { WiringModule } from './modules/wiring/index.js';
import { SharedInfrastructureModule } from './shared/infrastructure/index.js';

@Module({
  imports: [SharedInfrastructureModule, WiringModule],
})
export class AppModule {}
