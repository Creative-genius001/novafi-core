/* eslint-disable prettier/prettier */

import { IsNotEmpty, IsString } from "class-validator";



export class RetrieveAccountNameDto {
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  accountBank: string;
}
