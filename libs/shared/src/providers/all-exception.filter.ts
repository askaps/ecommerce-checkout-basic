import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse, LoggerModule } from '.';
import { ErrorMessages } from '../constants';
import { CheckedException } from './checked.exception';

@Catch(CheckedException)
export class AllExceptionsFilter implements ExceptionFilter {
  logger = new LoggerModule(AllExceptionsFilter.name);

  /**
   * Catches and handles a CheckedException.
   *
   * @param {CheckedException} exception - The exception to be caught and handled.
   * @param {ArgumentsHost} host - The host object that contains information about the current request.
   * @return {void} This function does not return anything.
   */
  catch(exception: CheckedException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let { message, statusCode } = exception;
    const contextId = exception.contextId;

    // for default errors
    if (typeof exception.getResponse === 'function' && typeof exception.getResponse() === 'object') {
      const exceptionResponse = exception.getResponse();
      statusCode = exceptionResponse['statusCode'];
    } else {
      message = exception.toString();
    }

    this.logger.error(contextId, message);

    const apiResp = new ApiResponse<any>(exception.body ?? null, statusCode, message, false);

    response.status(apiResp.statusCode).json(apiResp);
  }
}

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  logger = new LoggerModule(AllExceptionsFilter.name);

  /**
   * Catches and handles a BadRequestException.
   *
   * @param {BadRequestException} exception - The exception to be caught and handled.
   * @param {ArgumentsHost} host - The host object that contains information about the current request.
   * @return {void} This function does not return anything.
   */
  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception?.getResponse();
    const statusCode = exception.getStatus();
    const message = exception.message || ErrorMessages.SOMETHING_WENT_WRONG;
    const body = exceptionResponse ? exceptionResponse['message'] : null;

    const apiResp = new ApiResponse<any>(body, statusCode, message, false);

    response.status(apiResp.statusCode).json(apiResp);
  }
}
