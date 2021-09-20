/// <reference types="node" />
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { NFTPacksAccountType } from '../NFTPacksProgram';
import { Buffer } from 'buffer';
export declare enum ActionOnProve {
    Burn = 0,
    Redeem = 1
}
export interface PackVoucherData {
    accountType: NFTPacksAccountType;
    packSet: StringPublicKey;
    master: StringPublicKey;
    metadata: StringPublicKey;
    tokenAccount: StringPublicKey;
    maxSupply?: number;
    currentSupply: number;
    numberToOpen: number;
    actionOnProve: ActionOnProve;
}
export declare class PackVoucher extends Account<PackVoucherData> {
    static readonly PREFIX = "voucher";
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static getPDA(packSet: AnyPublicKey, index: number): Promise<PublicKey>;
}
