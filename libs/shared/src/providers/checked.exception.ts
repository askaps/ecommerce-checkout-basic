import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerModule } from './logger';

export class CheckedException extends HttpException {
  message: any;
  statusCode: number;
  contextId: string;
  body: any;

  constructor(message: any, statusCode?: number, contextId?: string, body?: any) {
    if (contextId) {
      message = `${message?.toString()}`;
    }

    super(message, statusCode ? statusCode : HttpStatus.INTERNAL_SERVER_ERROR);

    const logger = new LoggerModule(CheckedException.name);
    logger.error(contextId, message);

    this.message = message;
    this.body = body;

    this.statusCode = statusCode ? statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
    this.contextId = contextId;
  }
}
