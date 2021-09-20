/// <reference types="node" />
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Account } from '../../../Account';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { SafetyDepositBox } from './SafetyDepositBox';
import { VaultKey } from '../VaultProgram';
import { Buffer } from 'buffer';
export declare enum VaultState {
    Inactive = 0,
    Active = 1,
    Combined = 2,
    Deactivated = 3
}
export interface VaultData {
    key: VaultKey;
    tokenProgram: StringPublicKey;
    fractionMint: StringPublicKey;
    authority: StringPublicKey;
    fractionTreasury: StringPublicKey;
    redeemTreasury: StringPublicKey;
    allowFurtherShareCreation: boolean;
    pricingLookupAddress: StringPublicKey;
    tokenTypeCount: number;
    state: VaultState;
    lockedPricePerShare: BN;
}
export declare class Vault extends Account<VaultData> {
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static getPDA(pubkey: AnyPublicKey): Promise<PublicKey>;
    static isCompatible(data: Buffer): boolean;
    getSafetyDepositBoxes(connection: Connection): Promise<SafetyDepositBox[]>;
}
