/* eslint-disable prettier/prettier */
// src/redis/redis.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import  IoRedis  from 'ioredis'; 
import { AppLogger } from 'src/common/logger/logger.service';
import { RedisLockService } from './redis-lock.service';

@Module({})
export class RedisModule {

  static forRootAsync(): DynamicModule {
    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        RedisService,
        {
          provide: 'REDIS_CLIENT',
          useFactory: (configService: ConfigService, logger: AppLogger) => {
            const client = new IoRedis({
              host: configService.get<string>('REDIS_HOST', 'localhost'),
              port: configService.get<number>('REDIS_PORT', 6379),
            });
            client.on('connecting', ()=> {
              logger.info('Redis is connecting')
            })
            client.on('connect', ()=> {
              logger.info('Redis client connected')
            })
            client.on('error', (err) => {
              logger.error('Redis Client Error', err);
            });
            return client;
          },
          inject: [ConfigService, AppLogger],
        },
      ],
      exports: [RedisService, RedisLockService],
      global: true, 
    };
  }
}