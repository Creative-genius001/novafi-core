/* eslint-disable prettier/prettier */
import { Module, DynamicModule } from '@nestjs/common';
import { RedisService } from './redis.service';
import  IoRedis  from 'ioredis'; 
import { AppLogger } from 'src/common/logger/logger.service';
import { RedisLockService } from './redis-lock.service';

@Module({})
export class RedisModule {

  static forRootAsync(): DynamicModule {
    return {
      module: RedisModule,
      imports: [],
      providers: [
        RedisService,
        RedisLockService,
        {
          provide: 'REDIS_CLIENT',
          useFactory: (logger: AppLogger) => {
            const client = new IoRedis({
              host: 'localhost',
              port: 6379,
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
          inject: [AppLogger],
        },
      ],
      exports: [RedisService, RedisLockService],
      global: true, 
    };
  }
}