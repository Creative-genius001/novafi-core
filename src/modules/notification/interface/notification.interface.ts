/* eslint-disable prettier/prettier */
export interface CreateNotification {
    title: string,
    message: string,
    category: ICategory,
    type: INotificationType,
}


export type ICategory = 'TRANSACTION' | 'ACTIVITIES';

export type INotificationType = 'DEPOSIT' | 'TRANSFER' | 'SERVICES';

export interface NotificationJobData {
  userId: string,
  firstname: string,
  email: string,
  phone: string,
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
  | "OTP_VERIFICATION";

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
  }
};
