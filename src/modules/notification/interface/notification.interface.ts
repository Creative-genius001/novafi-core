/* eslint-disable prettier/prettier */
export interface CreateNotification {
    title: string,
    message: string,
    category: ICategory,
    type: INotificationType,
}


export type ICategory = 'TRANSACTION' | 'ACTIVITIES';

export type INotificationType = 'DEPOSIT' | 'TRANSFER' | 'SERVICES';

export enum NotificationTitle {
  OTP_VERIFICATION = 'Otp Verification',
  BILL_SUCCESS = 'Bill Payment Successful',
  BILL_FAILED = 'Bill Payment Failed',
  TRANSFER_SUCCESS = 'Transfer Successful',
  TRANSFER_FAILED = 'Transfer Failed',
  DEPOSIT_SUCCESS = 'Deposit Successful',
  AIRTIME_SUCCESS = 'Airtime Payment Successful',
  AIRTIME_FAILED = 'Airtime Payment Failed',
  DEPOSIT_FAILED = 'Deposit Failed',
  WELCOME = 'Welcome to Novafi'
} 

export interface NotificationJobData {
  userId: string,
  firstname: string,
  email: string,
  phone: string,
  title: NotificationTitle,
  type: INotificationType,    
  medium: "email" | "sms" | "inapp",
  templatePath: string,
  metadata: Record<string, any>,
  category: ICategory
}



export type NotificationEvent =
  | "TRANSFER_SUCCESS"
  | "BILL_SUCCESS"
  | "DEPOSIT_SUCCESS"
  | "DEPOSIT_FAILED"
  | "WELCOME"
  | "OTP_VERIFICATION"
  | "AIRTIME_SUCCESS"
  | "AIRTIME_FAILED"
  | "BILL_FAILED"
  | "TRANSFER_FAILED";

export const NotificationMapping: Record<
  NotificationEvent,
  { medium: ("sms" | "email" | "inapp" | "push")[]; template: string }
> = {
  TRANSFER_SUCCESS: {
    medium: ["email", "inapp"],
    template: "transfer_success"
  },
  BILL_SUCCESS: {
    medium: ["email", "inapp"],
    template: "bill_success"
  },
  DEPOSIT_SUCCESS: {
    medium: ["email", "inapp"],
    template: "deposit_success"
  },
  DEPOSIT_FAILED: {
    medium: ["email"],
    template: "deposit_failed"
  },
  OTP_VERIFICATION: {
    medium: ["email"],
    template: "otp_verification"
  },
  WELCOME: {
    medium: ["email"],
    template: "welcome"
  },
  AIRTIME_SUCCESS: {
    medium: ["inapp"],
    template: "airtime_success"
  },
  AIRTIME_FAILED: {
    medium: ["inapp"],
    template: "airtime_failed"
  },
  BILL_FAILED: {
    medium: ["inapp"],
    template: "bill_failed"
  },
  TRANSFER_FAILED: {
    medium: ["inapp"],
    template: "transfer_failed"
  },
  
};
