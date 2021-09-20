/// <reference types="node" />
import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { NFTPacksAccountType } from '../NFTPacksProgram';
import { Buffer } from 'buffer';
export declare enum DistributionType {
    FixedNumber = 0,
    ProbabilityBased = 1
}
export interface Distribution {
    type: DistributionType;
    value: BN;
}
export interface PackCardData {
    accountType: NFTPacksAccountType;
    packSet: StringPublicKey;
    master: StringPublicKey;
    metadata: StringPublicKey;
    tokenAccount: StringPublicKey;
    maxSupply?: number;
    distribution: Distribution;
    currentSupply: number;
}
export declare class PackCard extends Account<PackCardData> {
    static readonly PREFIX = "card";
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static getPDA(packSet: AnyPublicKey, index: number): Promise<PublicKey>;
}
