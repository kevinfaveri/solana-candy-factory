/// <reference types="node" />
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { VaultKey } from '../VaultProgram';
import { Buffer } from 'buffer';
export interface SafetyDepositBoxData {
    key: VaultKey;
    vault: StringPublicKey;
    tokenMint: StringPublicKey;
    store: StringPublicKey;
    order: number;
}
export declare class SafetyDepositBox extends Account<SafetyDepositBoxData> {
    constructor(key: AnyPublicKey, info: AccountInfo<Buffer>);
    static getPDA(vault: AnyPublicKey, mint: AnyPublicKey): Promise<PublicKey>;
    static isCompatible(data: Buffer): boolean;
}
