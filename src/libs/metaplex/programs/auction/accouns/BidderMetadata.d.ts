/// <reference types="node" />
import { AccountInfo } from '@solana/web3.js';
import BN from 'bn.js';
import { Account } from '../../../Account';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Buffer } from 'buffer';
export interface BidderMetadataData {
    bidderPubkey: StringPublicKey;
    auctionPubkey: StringPublicKey;
    lastBid: BN;
    lastBidTimestamp: BN;
    cancelled: boolean;
}
export declare class BidderMetadata extends Account<BidderMetadataData> {
    static readonly DATA_SIZE: number;
    constructor(key: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
}
