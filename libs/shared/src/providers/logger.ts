import { Logger } from '@nestjs/common';

export class LoggerModule {
  private readonly logger: Logger;
  constructor(private name: string) {
    this.logger = new Logger();
  }

  info(ctx: string, message: string) {
    return this.logger.log(message, { class: this.name, ctx });
  }

  error(ctx: string, error: string) {
    return this.logger.error(error, { class: this.name, ctx }, { class: this.name, ctx });
  }

  warn(ctx: string, message: string) {
    return this.logger.warn(message, { class: this.name, ctx });
  }

  debug(ctx: string, message: string) {
    return this.logger.debug(message, { class: this.name, ctx });
  }
}
