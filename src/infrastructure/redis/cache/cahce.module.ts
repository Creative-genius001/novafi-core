/* eslint-disable prettier/prettier */
// import { Module } from '@nestjs/common';
// import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
// import * as redisStore from 'cache-manager-redis-store';

// @Module({
//   imports: [
//     NestCacheModule.registerAsync({
//       isGlobal: true,
//       useFactory: () => ({
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//         store: redisStore as any,
//         host: 'localhost',
//         port: 6379,
//         ttl: 60, 
//       }),
//     }),
//   ],
//   exports: [NestCacheModule],
// })
// export class CacheModule {}