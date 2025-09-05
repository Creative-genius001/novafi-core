/* eslint-disable prettier/prettier */
import { IsOptional, IsString, IsNotEmpty } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

}

export class createBeneficiaryDto{
  @IsNotEmpty()
  @IsString()
  bankCode: string;

  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  beneficiaryName: string;

  @IsOptional()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  bankName: string;
}
