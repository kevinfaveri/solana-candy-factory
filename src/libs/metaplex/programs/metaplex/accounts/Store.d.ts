/// <reference types="node" />
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { MetaplexKey } from '../MetaplexProgram';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { WhitelistedCreator } from './WhitelistedCreator';
import { AuctionManager } from './AuctionManager';
import { Account } from '../../../Account';
import { Buffer } from 'buffer';
export interface StoreData {
    key: MetaplexKey;
    public: boolean;
    auctionProgram: StringPublicKey;
    tokenVaultProgram: StringPublicKey;
    tokenMetadataProgram: StringPublicKey;
    tokenProgram: StringPublicKey;
}
export declare class Store extends Account<StoreData> {
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static getPDA(owner: AnyPublicKey): Promise<PublicKey>;
    getWhitelistedCreators(connection: Connection): Promise<WhitelistedCreator[]>;
    getAuctionManagers(connection: Connection): Promise<AuctionManager[]>;
}
