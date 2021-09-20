/// <reference types="node" />
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Account } from '../../../Account';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Edition } from './Edition';
import { MetadataKey } from '../MetadataProgram';
import { Buffer } from 'buffer';
export interface MasterEditionData {
    key: MetadataKey;
    supply: BN;
    maxSupply?: BN;
    printingMint: StringPublicKey;
    oneTimePrintingAuthorizationMint: StringPublicKey;
}
export declare class MasterEdition extends Account<MasterEditionData> {
    static readonly EDITION_PREFIX = "edition";
    constructor(key: AnyPublicKey, info: AccountInfo<Buffer>);
    static getPDA(mint: AnyPublicKey): Promise<PublicKey>;
    static isCompatible(data: Buffer): boolean;
    static isMasterEditionV1(data: Buffer): boolean;
    static isMasterEditionV2(data: Buffer): boolean;
    getEditions(connection: Connection): Promise<Edition[]>;
}
