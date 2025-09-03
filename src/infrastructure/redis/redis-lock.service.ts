/* eslint-disable prettier/prettier */
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class RedisLockService implements OnModuleInit {
  private redlock: Redlock;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  onModuleInit() {
    this.redlock = new Redlock([this.redis], {
      retryCount: 10,
      retryDelay: 200,
    });
  }

  async lock(resource: string, ttl: number): Promise<Redlock.Lock> {
    return this.redlock.acquire([resource], ttl);
  }

  async release(lock: Redlock.Lock){
    return this.redlock.release(lock)
  }
}
