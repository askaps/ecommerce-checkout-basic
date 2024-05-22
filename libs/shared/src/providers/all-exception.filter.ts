import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse, LoggerModule } from '.';
import { ErrorMessages } from '../constants';
import { CheckedException } from './checked.exception';

@Catch(CheckedException)
export class AllExceptionsFilter implements ExceptionFilter {
  logger = new LoggerModule(AllExceptionsFilter.name);
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

    const apiResp = new ApiResponse<any>(false, exception.body ?? null, statusCode, message);

    response.status(apiResp.statusCode).json(apiResp);
  }
}

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  logger = new LoggerModule(AllExceptionsFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception?.getResponse();
    const statusCode = exception.getStatus();
    const message = exception.message || ErrorMessages.SOMETHING_WENT_WRONG;
    const body = exceptionResponse ? exceptionResponse['message'] : null;

    const apiResp = new ApiResponse<any>(false, body, statusCode, message);

    response.status(apiResp.statusCode).json(apiResp);
  }
}
