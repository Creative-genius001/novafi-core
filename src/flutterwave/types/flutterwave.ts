/* eslint-disable prettier/prettier */


export interface CreateVBA {
  email: string;
  currency: 'NGN';
  amount: number;
  firstname: string;
  lastname: string;
  tx_ref: string;
  is_permanent: boolean;
  narration: string;
  phonenumber: string;
  bank_code: string;
}

export enum BillCategoryCode {
    AIRTIME,
    MOBILEDATA,
    CABLEBILLS,
    UTILITYBILLS
}

export interface CreateBillPayment {
    biller_code: string,
    item_code: string,
    country: string,
    customer_id: string,
    amount: number,
    reference: string,
    callback_url: string
}
