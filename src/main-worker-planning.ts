import { NestFactory } from '@nestjs/core';
import { PlanningModule } from './planning/planning.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WorkerPlanningBootstrap');

  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.createApplicationContext(PlanningModule, {
    logger: isProduction
      ? ['log', 'error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  await app.init();

  logger.log('Worker de Planificación Matemática iniciado correctamente');

  app.enableShutdownHooks();
}
bootstrap().catch((err) => {
  console.error('Error fatal al iniciar el Worker de Planificación', err);
  process.exit(1);
});
