/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import Redis  from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl: number): Promise<string> {
    return this.client.set(key, value, 'EX', ttl);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async saad(key: string, item: string){
    return this.client.sadd(key, item)
  }

  async sisMember(key: string, item: string){
    return this.client.sismember(key, item)
  }

  async keys(key: string): Promise<string[]>{
    return this.client.keys(key)
  }

  async jsonSet(key: string, path: string, data: any): Promise<string> {
    return this.client.call('JSON.SET', key, path, JSON.stringify(data)) as Promise<string>;
  }
  async jsonGet(key: string, path: string): Promise<any> {
    const result = await this.client.call('JSON.GET', key, path) as string;
    return JSON.parse(result);
  }
}