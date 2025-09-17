/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppLogger } from 'src/common/logger/logger.service';
import nodemailer from 'nodemailer';
import { config } from 'src/config/config';

type NodemailerTransporter = nodemailer.Transporter<nodemailer.SentMessageInfo>;


@Injectable()
export class NodemailerService {

    private transporter: NodemailerTransporter;

    constructor(
        private readonly logger: AppLogger
    ){
       this.transporter = nodemailer.createTransport({
            host: 'smtp.privateemail.com',
            port: 465,
            secure: true,
            auth: {
                user: config.SMTP_USERNAME,
                pass: config.SMTP_PASSWORD,
            },

            //for dev environment only
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    async sendEmail(email: string, message: string) {

        const mailOptions: nodemailer.SendMailOptions = {
            from: '"Novafi" admin@edspl.com.au',
            to: email,
            subject: 'OTP Verification Code',
            text: message,
            html: message,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            this.logger.error('SEND_EMAIL', error)
            throw new InternalServerErrorException('Failed to send email');
        }
    }

    
}
