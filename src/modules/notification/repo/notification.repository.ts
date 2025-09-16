/* eslint-disable prettier/prettier */

import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { Notification, NotificationStatus } from "@prisma/client"
import { AppLogger } from "../../../common/logger/logger.service";
import { Injectable } from "@nestjs/common";
import { CreateNotification } from "../interface/notification.interface";



@Injectable()
export class NotificationRepository {
  constructor(
    private readonly logger: AppLogger,
    private readonly prisma: PrismaService,
    
    ) {}

    async createNotification(userId: string, notification: CreateNotification) {
        const { title, message, category, type } = notification;

        return await this.prisma.notification.create({
            data: {
                userId,
                title, 
                message,
                category,
                type
            }
        })
    }

    async getNotifications(userId: string) {
        return await this.prisma.notification.findMany({
            where: {userId},
        })
    }

    async updateNotification(notificationId: string, status: NotificationStatus) {
        try {
            return await this.prisma.notification.update({
                where: { id: notificationId },
                data: { status },
            });
        } catch (error) {
            this.logger.error(`Failed to update notification with ID ${notificationId}:`, error);
            throw error;
        }
    }
}