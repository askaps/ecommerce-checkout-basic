import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';
const { combine, timestamp, printf } = format;

export class LogConfiguration {
  getWinstonConfiguredInstance(appName: string) {
    // The custom format for the log messages
    const customFormat = printf(({ level, message, context, timestamp }) => {
      const className = context && context.class ? context.class : context;
      const logId = context && context.ctx ? context.ctx : '';
      return `[${timestamp}] [${appName}] [${level}] [${message}] [${className}] [${logId}]`;
    });

    const fileTransport = new transports.DailyRotateFile({
      handleExceptions: true,
      filename: `logs/${appName}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '100m',
    });

    const debugEnvs = ['dev', 'local'];
    const logger = WinstonModule.createLogger({
      transports: [fileTransport, new transports.Console()],
      format: combine(timestamp(), customFormat),
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
      },
      level: debugEnvs.includes(process.env.NODE_ENV) ? 'debug' : 'info',
    });

    return logger;
  }
}
