/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionsFilter } from './common/filters/http-exceptions.filter';
import { AppLogger } from './common/logger/logger.service';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config(); 
  
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  const logger = app.get(AppLogger)
  app.useLogger(logger);
  app.use(helmet())

  app.useGlobalFilters(new HttpExceptionsFilter(logger));
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, 
  //     dismissDefaultMessages: true,
  //     forbidNonWhitelisted: true, 
  //     transform: true,
  //   }),
  // );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.info(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
