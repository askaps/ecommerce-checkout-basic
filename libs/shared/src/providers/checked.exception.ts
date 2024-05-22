import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerModule } from './logger';

export class CheckedException extends HttpException {
  message: any;
  statusCode: number;
  contextId: string;
  body: any;

  /**
   * Constructs a new instance of the CheckedException class.
   *
   * @param {any} message - The error message.
   * @param {number} [statusCode] - The HTTP status code. Defaults to HttpStatus.INTERNAL_SERVER_ERROR.
   * @param {string} [contextId] - The context ID for logging.
   * @param {any} [body] - Additional error data.
   */
  constructor(message: any, statusCode?: number, contextId?: string, body?: any) {
    if (contextId) {
      message = `${message?.toString()}`;
    }

    super(message, statusCode ? statusCode : HttpStatus.INTERNAL_SERVER_ERROR);

    /**
     * Logs the exception with the given context id and message.
     */
    const logger = new LoggerModule(CheckedException.name);
    logger.error(contextId, message);

    this.message = message;
    this.body = body;

    this.statusCode = statusCode ? statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
    this.contextId = contextId;
  }
}
