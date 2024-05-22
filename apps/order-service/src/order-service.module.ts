import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import configSchema from './config/config.schema';
import configuration from './config/configuration';
import { LoggerMiddleware } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
      validationSchema: configSchema,
      cache: true,
    }),
    CacheModule.register(),
  ],
})
export class OrderServiceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
