/* eslint-disable prettier/prettier */

import { IsEnum, IsNotEmpty, IsString, IsNumber, IsUrl } from 'class-validator';
import { BillCategoryCode } from 'src/flutterwave/types/flutterwave';




export class GetBillInformationDto {
  @IsNotEmpty()  
  @IsEnum(BillCategoryCode)
  categoryCode: BillCategoryCode;
}

export class CreateBillPaymentDto {
  @IsNotEmpty()
  @IsString()
  billerCode: string;

  @IsNotEmpty()
  @IsString()
  itemCode: string;

  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  reference: string;

  @IsUrl()
  @IsString()
  callbackUrl: string;
}

export class RetrieveAccountNameDto {
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  accountBank: string;
}
