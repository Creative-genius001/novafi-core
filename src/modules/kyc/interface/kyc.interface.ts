/* eslint-disable prettier/prettier */

export interface InitiateBvnVerificationResponse {
    status: string,
    message: string,
    data: {
        url: string,
        reference: string,
    }
}

export interface BvnData {
  bvn: string;
  nin: string;
  email: string;
  gender: string;
  surname: string;
  serialNo: string;
  faceImage: string;
  firstName: string;
  landmarks: string;
  branchName: string;
  middleName: string;
  nameOnCard: string;
  dateOfBirth: string;
  lgaOfOrigin: string;
  watchlisted: string;
  lgaOfCapture: string;
  phoneNumber1: string | null;
  phoneNumber2: string;
  maritalStatus: string;
  stateOfOrigin: string;
  enrollBankCode: string;
  enrollUserName: string;
  enrollmentDate: string;
  lgaOfResidence: string;
  stateOfCapture: string;
  additionalInfo1: string;
  productReference: string;
  stateOfResidence: string;
}

export interface Data {
  first_name: string;
  last_name: string;
  status: string;
  reference: string;
  callback_url: string | null;
  bvn_data: BvnData;
  created_at: string;
  complete_message: string;
}

export interface BvnVerificationResponse {
  status: string;
  message: string;
  data: Data;
}

export interface BvnRecord {
  firstName: string;
  lastName: string;
  middleName?: string;
  bvn: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  bvnReference: string;
  faceImageUrl?: string;
  gender: string,
  nin: string
}
