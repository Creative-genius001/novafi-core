/* eslint-disable prettier/prettier */
export enum KycStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  VERIFIED = 'VERIFIED',
}

export enum KycLevel {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
}

export type UpdateLevelData = {
  status: KycStatus;
  level: KycLevel;
};
