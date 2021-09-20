/// <reference types="node" />
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { NFTPacksAccountType } from '../NFTPacksProgram';
import { Buffer } from 'buffer';
export interface ProvingProcessData {
    accountType: NFTPacksAccountType;
    userWallet: StringPublicKey;
    packSet: StringPublicKey;
    provedVouchers: number;
    provedVoucherEditions: number;
    claimedCards: number;
    claimedCardEditions: number;
}
export declare class ProvingProcess extends Account<ProvingProcessData> {
    static readonly PREFIX = "proving";
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static getPDA(packSet: AnyPublicKey, userWallet: AnyPublicKey): Promise<PublicKey>;
}
