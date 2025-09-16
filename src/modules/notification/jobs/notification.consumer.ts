/* eslint-disable prettier/prettier */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationService } from '../notification.service';

@Processor('notifications')
export class NotificationConsumer extends WorkerHost {
    constructor(private readonly notificationService: NotificationService) {
        super();
    }

  async process(job: Job): Promise<any> {
    
    await this.notificationService.sendNotification(job);
    return {}
  }
  

}