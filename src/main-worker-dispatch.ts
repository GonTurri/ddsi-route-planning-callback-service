import { NestFactory } from '@nestjs/core';
import { DispatchModule } from './dispatch/dispatch.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WorkerDispatchBootstrap');

  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.createApplicationContext(DispatchModule, {
    logger: isProduction
      ? ['log', 'error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  await app.init();

  logger.log('Worker de Envío de Webhooks iniciado correctamente');

  app.enableShutdownHooks();
}
bootstrap().catch((err) => {
  console.error('Error fatal al iniciar el Worker de Dispatch', err);
  process.exit(1);
});
