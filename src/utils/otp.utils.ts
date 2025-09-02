/* eslint-disable prettier/prettier */
import { randomInt } from 'crypto';

export function generateSecureOTP(): string {
  return randomInt(100000, 999999).toString();
}
