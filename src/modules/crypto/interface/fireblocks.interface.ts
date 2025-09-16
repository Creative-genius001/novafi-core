/* eslint-disable prettier/prettier */
export interface DepositAddress {
    cryptoType: string;
    network: string;
    address: string;
    isActive: boolean;
}

export enum CryptoType {
  USDT = 'USDT',
  BTC = 'BTC',
  SOL = 'SOL',
  BNB = 'BNB',
  ETH = 'ETH',
}

export enum Network {
  ETHEREUM = 'ethereum',
  BSC = 'bsc',
  TRON = 'tron',
  BITCOIN = 'bitcoin',
  SOLANA = 'solana',
}