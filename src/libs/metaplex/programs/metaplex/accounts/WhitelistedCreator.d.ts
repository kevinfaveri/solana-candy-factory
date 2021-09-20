/// <reference types="node" />
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { MetaplexKey } from '../MetaplexProgram';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { Account } from '../../../Account';
import { Buffer } from 'buffer';
export interface WhitelistedCreatorData {
    key: MetaplexKey;
    address: StringPublicKey;
    activated: boolean;
}
export declare class WhitelistedCreator extends Account<WhitelistedCreatorData> {
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static getPDA(store: AnyPublicKey, creator: AnyPublicKey): Promise<PublicKey>;
}
