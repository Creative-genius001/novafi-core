/* eslint-disable prettier/prettier */
import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { AppLogger } from 'src/common/logger/logger.service';
import { Repository } from '../user/repo/user.repository';
import { NotificationRepository } from './repo/notification.repository';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationService {
    constructor(
        private readonly logger: AppLogger,
        private readonly userRepository: Repository,
        private readonly notificationRepository: NotificationRepository,
        @InjectQueue('notifications') private readonly notificationQueue: Queue,
    ){}

    async queueNotification(
        userId: string,
        medium: 'EMAIL' | 'SMS' | 'INAPP',
        type: 'DEPOSIT' | 'TRANSFER' | 'SERVICES',
        message: string,
        title: string,
        category: 'TRANSACTION' | 'ACTIVITIES',
        metadata?: Record<string, any>,
    ) {
        
        try {

        const user = await this.userRepository.findById(userId);
        if (!user) {
            this.logger.warn('User not found for notification', { userId, type });
            throw new BadRequestException('User not found!');
        }
        
        let notification: Notification | null = null;
        
        if(medium === 'INAPP'){
            const notificationObj = {
                type,
                message,
                category,
                title,
            }
            
            notification = await this.notificationRepository.createNotification(
                userId,
                notificationObj
            );
        }

        if(notification === null){
            this.logger.error('NOTIFICATION_NULL', {message: 'Create notification returned a null value instead of a data object'})
            throw new InternalServerErrorException()
        }
        await this.notificationQueue.add('send-notification', {
            notificationId: notification.id,
            userId,
            email: user.email,
            phone: user.phone,
            medium,
            type,
            message,
            metadata,
        });

        this.logger.debug('Notification queued', { notificationId: notification.id, type });
        
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.logger.error('Failed to queue notification', { userId, type, error});
            throw new InternalServerErrorException();
        }
    }


    async sendNotification(job: any){
        const { notificationId, userId, email, phone, type, medium, message, metadata } = job.data;

        
        try {
            switch (medium) {
                case 'EMAIL':
                await this.sendEmail(email, message, type, metadata);
                break;
                case 'SMS':
                await this.sendSMS(phone, message);
                break;
                case 'INAPP':
                await this.sendPush(userId, message, type, metadata);
                break;
                default:
                throw new BadRequestException(`Unsupported medium: ${medium}`);
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await this.notificationRepository.updateNotification(notificationId, 'SENT');

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.logger.info('Notification sent', { notificationId, medium, type });

            } catch (error) {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await this.notificationRepository.updateNotification(notificationId, 'FAILED');

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.logger.error('Failed to send notification', { notificationId, medium, type, error });

            throw error;
        }
    }
}
