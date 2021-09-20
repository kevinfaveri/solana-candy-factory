/// <reference types="node" />
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { MetadataKey } from '../MetadataProgram';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Account } from '../../../Account';
import { Buffer } from 'buffer';
export interface EditionData {
    key: MetadataKey;
    parent: StringPublicKey;
    edition: BN;
}
export declare class Edition extends Account<EditionData> {
    static readonly EDITION_PREFIX = "edition";
    constructor(key: AnyPublicKey, info: AccountInfo<Buffer>);
    static getPDA(mint: AnyPublicKey): Promise<PublicKey>;
    static isCompatible(data: Buffer): boolean;
}
