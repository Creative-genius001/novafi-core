/* eslint-disable prettier/prettier */
import { randomInt } from 'crypto';

export function generateSecureOTP(): string {
  return randomInt(100000, 999999).toString();
}

export function generateNovaId(): string {
  return randomInt(0, 100000000).toString();
}

export function generateIdempotencyKey() {

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  

  const keyLength = 15;

  let randomKey = '';
  for (let i = 0; i < keyLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomKey += characters.charAt(randomIndex);
  }
  
  return randomKey;
}


export function generateTxRef() {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 8);
  return `'tx_'${timestamp}_${random}`;
}
