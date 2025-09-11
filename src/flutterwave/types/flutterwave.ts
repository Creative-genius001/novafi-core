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
  bvn: string;
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

export interface RetrieveAccountName {
  account_number: string,
  account_bank: string
}

export interface VirtualAccountResponse {
  status: string;
  message: string;
  data: {
    response_code: string;
    response_message: string;
    flw_ref: string;
    order_ref: string;
    account_number: string;
    frequency: string;
    bank_name: string;
    created_at: string;
    expiry_date: string;
    note: string;
    amount: number | null;
  };
}

export interface GetBanksResponse {
  status: string,
  message: string,
  data: Array<{
    id: number,
    code: string,
    name: string
  }>
}

export interface RetrieveAccountNameResponse {
  status: string,
  message: string,
  data: {
    account_number: string,
    account_name: string
  }
}

export interface InitiateBvnVerificationResponse {
  status: string,
  message: string,
  data: {
    url: string,
    reference: string
  }
}

export interface GetBillerInformationResponse {
  status: string,
  message: string,
  data: Array<{
    id: number,
    name: string,
    logo: string | null,
    description: string,
    short_name: string,
    biller_code: string,
    country_code: string
  }>
}

export interface BillPaymentResponse {
  status: string;
  message: string;
  data: {
    phone_number: string;
    amount: number;
    network: string;
    code: string;
    tx_ref: string;
    reference: string;
    batch_reference: string | null;
    recharge_token: string | null;
    fee: number;
  };
}

export interface BillPaymentStatusResponse {
  status: string;
  message: string;
  data: {
    extra: string;
    amount: number;
    flw_ref: string;
    currency: string;
    tx_ref: string;
    token: string;
    fee: number;
  };
}