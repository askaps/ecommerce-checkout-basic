import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import configSchema from './config/config.schema';
import configuration from './config/configuration';
import { LoggerMiddleware } from '@app/shared';
import { CartsModule } from './carts/carts.module';
import { CheckoutsModule } from './checkouts/checkouts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
      validationSchema: configSchema,
      cache: true,
    }),
    CacheModule.register({ isGlobal: true }),
    CartsModule,
    CheckoutsModule,
  ],
})
export class OrderServiceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
