/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { LoggerModule } from 'src/common/logger/logger.module';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { join } from 'path';
import { NotificationConsumer } from './jobs/notification.consumer';
import { Repository } from '../user/repo/user.repository';
import { NotificationRepository } from './repo/notification.repository';
import { NodemailerService } from 'src/infrastructure/nodemailer/nodemailer.service';

@Module({
  imports: [LoggerModule, PrismaModule,
    BullModule.registerQueue({
      name: 'notifications',
      processors: [join(__dirname, 'processor.js')],
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [NotificationService, NotificationConsumer, Repository, NotificationRepository, NodemailerService],
  controllers: [NotificationController],
  exports: [NotificationService]
})
export class NotificationModule {}
