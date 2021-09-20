/// <reference types="node" />
import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { AnyPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { MetadataKey } from '../MetadataProgram';
import { Buffer } from 'buffer';
export interface EditionMarkerData {
    key: MetadataKey;
    ledger: number[];
}
export declare class EditionMarker extends Account<EditionMarkerData> {
    constructor(key: AnyPublicKey, info: AccountInfo<Buffer>);
    static getPDA(mint: AnyPublicKey, edition: BN): Promise<PublicKey>;
    static isCompatible(data: Buffer): boolean;
}
