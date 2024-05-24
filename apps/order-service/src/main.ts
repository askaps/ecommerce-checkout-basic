import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { OrderServiceModule } from './order-service.module';
import { AllExceptionsFilter, LogConfiguration, SetupSwagger } from '@app/shared';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);

  const configService = app.get(ConfigService);
  const appName = configService.get<string>('appName');
  const appPort = configService.get<number>('port');
  const env = configService.get<string>('env');

  const logger = new LogConfiguration().getWinstonConfiguredInstance(appName);
  try {
    app.setGlobalPrefix(`${appName}/api`);
    app.useLogger(logger);
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    SetupSwagger(app, appName, [OrderServiceModule]);
    logger.log(`Swagger url -> ${appName}/api/docs`, 'swagger');

    await app.listen(appPort);
    logger.log(`${appName} started on port ${appPort} in ${env} mode`, 'bootstrap');

    // Handle unhandled promise rejections logs
    process.on('unhandledRejection', (error) => {
      logger.error(error, 'bootstrap');
    });
  } catch (error) {
    logger.error(error);
  }
}
bootstrap();
