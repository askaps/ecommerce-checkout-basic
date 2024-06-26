import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  /**
   * A middleware that logs HTTP requests and responses.
   */
  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      this.logger.log(
        `method = "${method}", url = "${originalUrl}", status = ${statusCode}, contentLength = ${contentLength}, userAgent = ${userAgent}, ip = ${ip}`,
      );
    });

    next();
  }
}
