/* eslint-disable prettier/prettier */

import * as argon2 from 'argon2';

export function hashOtp(otp: string): Promise<string> {

  return argon2.hash(otp, { type: argon2.argon2id });
}

export function verifyOtpHash(hash: string, otp: string): Promise<boolean> {
  return argon2.verify(hash, otp);
}

export function withinCooldown(lastChange: Date | null, limit: number): boolean {
  if (!lastChange) return false;
  const diff = Date.now() - lastChange.getTime();
  return diff < limit * 24 * 60 * 60 * 1000;
}
