import { Catch, BadRequestException, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ErrorMessages } from '../constants';
import { LoggerModule } from './logger';
import { ApiResponse } from './api-response';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  logger = new LoggerModule(BadRequestExceptionFilter.name);

  /**
   * Catches and handles a BadRequestException.
   *
   * @param {BadRequestException} exception - The exception to be caught and handled.
   * @param {ArgumentsHost} host - The host object that contains information about the current request.
   * @return {void} This function does not return anything.
   */
  catch(exception: BadRequestException, host: ArgumentsHost): void {
    console.log('BadRequestException catch');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception?.getResponse();
    const statusCode = exception.getStatus();
    const message = exception.message || ErrorMessages.SOMETHING_WENT_WRONG;
    const body = exceptionResponse ? exceptionResponse['message'] : null;

    const apiResp = new ApiResponse<any>({ errors: body }, statusCode, message, false);

    response.status(apiResp.statusCode).json(apiResp);
  }
}
