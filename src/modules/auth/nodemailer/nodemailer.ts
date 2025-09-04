/* eslint-disable prettier/prettier */
import nodemailer from 'nodemailer';
import { config } from 'src/config/config';


type NodemailerTransporter = nodemailer.Transporter<nodemailer.SentMessageInfo>;


const transporter: NodemailerTransporter = nodemailer.createTransport({
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


export async function sendSigupOtp(email: string, otp: string): Promise<void> {
  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Novafi" admin@edspl.com.au',
    to: email,
    subject: 'OTP Verification Code',
    text: `Your OTP is: ${otp}. It will expire shortly.`,
    html: `<b>Your OTP is: ${otp}</b>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Failed to send OTP email.', error);
  }
}

export async function changeEmailOtp(email: string, otp: string): Promise<void> {
  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Novafi" admin@edspl.com.au',
    to: email,
    subject: 'Verify your new email',
    text: `Your OTP is: ${otp}. It will expire shortly.`,
    html: `<b>Your OTP is: ${otp}</b>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Failed to send OTP email.', error);
  }
}

export async function changePasswordOtp(email: string, otp: string): Promise<void> {
  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Novafi" admin@edspl.com.au',
    to: email,
    subject: 'Password change verification code',
    text: `Your OTP is: ${otp}. It will expire shortly.`,
    html: `<b>Your OTP is: ${otp}</b>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Failed to send OTP email.', error);
  }
}
