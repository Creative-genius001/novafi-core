/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class AppLogger {
  private logger: winston.Logger;

  constructor() {
    const { combine, timestamp, errors, json, prettyPrint } = winston.format;

    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: combine(timestamp(), errors({ stack: true }), json(), prettyPrint()),
      transports: [
        new winston.transports.Console({
          format: combine(
            timestamp(),
            prettyPrint(),
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
    });
  }
 
  log(log: Record<string, any> | string) {
    if (typeof log === 'string') {
      this.logger.info({ message: log });
    } else {
      this.logger.info(log);
    }
  }

  info(log: object | string) {
    if (typeof log === 'string') {
        this.logger.info({ message: log });
    }
    else{
        this.logger.info(log);
    }
  }

  warn(log: object | string) {
    if (typeof log === 'string') {
        this.logger.warn({ message: log });
    }
    else{
        this.logger.warn(log);
    }
  }

  error(log: object | string) {
    if (typeof log === 'string') {
        this.logger.error({ message: log });
    }
    else{
        this.logger.error(log);
    }
  }

  debug(log: object | string) {
    if (typeof log === 'string') {
        this.logger.debug({ message: log });
    }
    else{
        this.logger.debug(log);
    }
  }
}
