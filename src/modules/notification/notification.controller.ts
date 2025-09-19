/* eslint-disable prettier/prettier */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService
    ){}

    @Get()
    getNotifications(@Req() req) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = req.user.userId as string;
        return this.notificationService.getNotifcations(userId);
    }
}
