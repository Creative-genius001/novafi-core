/* eslint-disable prettier/prettier */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationService } from '../notification.service';
import { NotificationJobData } from '../interface/notification.interface';
import { AppLogger } from 'src/common/logger/logger.service';

@Processor('notifications')
export class NotificationConsumer extends WorkerHost {
    constructor(
      private readonly notificationService: NotificationService,
      private readonly logger: AppLogger
    ) {
        super();
    }

  async process(job: Job<NotificationJobData>): Promise<any> {
    await this.notificationService.sendNotification(job);
    return {}
  }
  

}