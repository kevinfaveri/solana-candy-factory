/// <reference types="node" />
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { Edition } from './Edition';
import { MasterEdition } from './MasterEdition';
import { MetadataKey } from '../MetadataProgram';
import { Buffer } from 'buffer';
export interface Creator {
    address: StringPublicKey;
    verified: boolean;
    share: number;
}
export interface MetadataDataData {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: Creator[] | null;
}
export interface MetadataData {
    key: MetadataKey;
    updateAuthority: StringPublicKey;
    mint: StringPublicKey;
    data: MetadataDataData;
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number | null;
    masterEdition?: StringPublicKey;
    edition?: StringPublicKey;
}
export declare class Metadata extends Account<MetadataData> {
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static getPDA(mint: AnyPublicKey): Promise<PublicKey>;
    getEdition(connection: Connection): Promise<Edition | MasterEdition>;
}
