import { Module } from '@nestjs/common';
import { CommonService } from './services';
import { LogConfiguration } from './providers/logger.configuration';
import { LoggerModule } from './providers/logger';

@Module({
  providers: [
    LogConfiguration,
    LoggerModule,
    {
      provide: 'SERVICE_NAME',
      useValue: 'test',
    },
    CommonService,
  ],
  exports: [LogConfiguration, LoggerModule, CommonService],
})
export class SharedModule {}
