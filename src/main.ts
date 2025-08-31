/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionsFilter } from './common/filters/http-exceptions.filter';
import { AppLogger } from './common/logger/logger.service';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); 
  
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  const logger = app.get(AppLogger)
  app.useLogger(logger);

  app.useGlobalFilters(new HttpExceptionsFilter(logger));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.info({message: `🚀 Application is running on: ${await app.getUrl()}`});
}
bootstrap();
