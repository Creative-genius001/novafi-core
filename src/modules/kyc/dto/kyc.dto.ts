/* eslint-disable prettier/prettier */

import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

const nigerianPhoneRegex = /^(\+234|0)?[789]\d{9}$/;

export class InitiateKycDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(nigerianPhoneRegex, { 
    message: 'Phone number is not valid'
  })
  phone: string;
}