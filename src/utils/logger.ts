import path from 'node:path';

import { createLogger, format, transports } from 'winston';

import envConfig from '../config/envConfig';

import type { Logform } from 'winston';

const consoleFormat = format.printf((info: Logform.TransformableInfo) => {
  const { level, message, timestamp } = info;

  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: envConfig.LOG_LEVEL,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat()
  ),
  defaultMeta: { service: 'event-management-api' },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), consoleFormat)
    }),
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'app.log'),
      level: 'info',
      format: format.json(),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: format.json(),
      maxsize: 5242880,
      maxFiles: 5
    })
  ],
  silent: envConfig.isTest
});

export default logger;
