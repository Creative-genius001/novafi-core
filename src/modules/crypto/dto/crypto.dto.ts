/* eslint-disable prettier/prettier */
import { IsEnum } from "class-validator";
import { CryptoType, Network } from "../interface/fireblocks.interface";

export class GenerateAddressQueryDto {
  @IsEnum(CryptoType)
  cryptoType: CryptoType;

  @IsEnum(Network)
  network: Network;
}
