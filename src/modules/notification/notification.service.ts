/* eslint-disable prettier/prettier */
import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { AppLogger } from 'src/common/logger/logger.service';
import { Repository } from '../user/repo/user.repository';
import { NotificationRepository } from './repo/notification.repository';
import { Notification } from '@prisma/client';
import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";
import Handlebars from "handlebars";
import { ICategory, INotificationType, NotificationEvent, NotificationJobData, NotificationMapping } from './interface/notification.interface';
import { NodemailerService } from 'src/infrastructure/nodemailer/nodemailer.service';

@Injectable()
export class NotificationService {
    
    private basePath = path.join(__dirname, "templates");

    constructor(
        private readonly logger: AppLogger,
        private readonly userRepository: Repository,
        private readonly notificationRepository: NotificationRepository,
        private readonly nodemailerService: NodemailerService,
        @InjectQueue('notifications') private readonly notificationQueue: Queue,
    ){}

    async queueNotification(
        userId: string,
        type: INotificationType,
        event: NotificationEvent,
        category: ICategory,
        metadata: Record<string, any>,
    ) {

        const config = NotificationMapping[event];

        if (!config) throw new Error(`No mapping found for ${event}`);

        for (const medium of config.medium) {
            const templateName = `${config.template}.${medium === "email" ? "ejs" : "json"}`;

            const templatePath = path.join(this.basePath, medium, templateName);

            try {

                const user = await this.userRepository.findById(userId);
                if (!user) {
                    this.logger.warn('User not found for notification', { userId, type });
                    throw new BadRequestException('User not found!');
                }
            

                await this.notificationQueue.add('send-notification', {
                    userId,
                    firstname: user.firstname,
                    email: user.email,
                    phone: user.phone,
                    medium,
                    type,
                    category,
                    templatePath,
                    metadata,
                });

                this.logger.debug('Notification queued', { userId, medium, type, metadata });
                
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                this.logger.error('Failed to queue notification', { userId, medium, type, metadata, error});
                throw new InternalServerErrorException();
            }

                
        }
        
        
    }


    async sendNotification(job: Job<NotificationJobData>){

        const { userId, email, firstname, type, medium, templatePath, metadata, category } = job.data;
        
        
        switch (medium) {
            case 'email':
                await this.sendEmail(userId, firstname, email, templatePath, metadata);
                break;
            case 'sms':
                await this.sendSms();
                break;
            case 'inapp':
                await this.sendInApp(userId, type, templatePath, category, medium, metadata);
                break;
            default:
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw new Error(`Unsupported medium: ${medium}`);
            }

        this.logger.info('Notification sent', { medium, type, metadata });

    }

    private async sendEmail(userId: string, firstname: string, email: string, templatePath: string, metadata: Record<string, any>) {

        const emailTemplate = this.renderEmail(templatePath, metadata);

        await this.nodemailerService.sendEmail(email, emailTemplate)
    }

    private async sendSms() {

    }

    private async sendInApp(userId: string, type: INotificationType, templatePath: string, category: ICategory, medium: string, metadata: Record<string, any>) {

        try {

            let notification: Notification | null = null;  

            const tempJson  = this.renderJsonTemplate(templatePath, metadata);
            const notificationObj = {
                type,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                message: tempJson.message,
                category,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                title: tempJson.title,
            }
                    
            notification = await this.notificationRepository.createNotification(
                userId,
                notificationObj
            );
                

            if(notification === null){
                this.logger.error('NOTIFICATION_NULL', {message: 'Create notification returned a null value instead of a data object'})
                throw new InternalServerErrorException()
            }

            //emit to websocket



            return notification;
                
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                this.logger.error('Failed to send inapp notification', { userId, type, medium, metadata, error});
                throw new InternalServerErrorException();
            }
    }

    private renderJsonTemplate(filePath: string, data: Record<string, any>): Record<string, any> {

        const raw = fs.readFileSync(filePath, "utf-8");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const template = JSON.parse(raw);

        const interpolate = (value: string): string =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            value.replace(/{{(\w+)}}/g, (_, key) => data[key] ?? "");

        const result: Record<string, any> = {};

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        for (const [key, value] of Object.entries(template)) {
            result[key] =
            typeof value === "string" ? interpolate(value) : value;
        }

        return result;
    }

    private renderEmail(filePath: string, data: Record<string, any>): string {
        const ext = path.extname(filePath);

        const template = fs.readFileSync(filePath, "utf-8");

        if (ext === ".ejs") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            return ejs.render(template, data);
        } else if (ext === ".hbs") {
            const compile = Handlebars.compile(template);
            return compile(data);
        } else {
            throw new Error(`Unsupported email template engine: ${ext}`);
        }
    }
}
