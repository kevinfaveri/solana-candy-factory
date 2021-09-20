/// <reference types="node" />
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { BidderMetadata } from './BidderMetadata';
import { BidderPot } from './BidderPot';
import { Buffer } from 'buffer';
export declare enum AuctionState {
    Created = 0,
    Started = 1,
    Ended = 2
}
export declare enum BidStateType {
    EnglishAuction = 0,
    OpenEdition = 1
}
export declare enum PriceFloorType {
    None = 0,
    Minimum = 1,
    BlindedPrice = 2
}
export interface Bid {
    key: StringPublicKey;
    amount: BN;
}
export interface BidState {
    type: BidStateType;
    bids: Bid[];
    max: BN;
}
export interface PriceFloor {
    type: PriceFloorType;
    hash: Uint8Array;
    minPrice?: BN;
}
export interface AuctionData {
    authority: StringPublicKey;
    tokenMint: StringPublicKey;
    lastBid: BN | null;
    endedAt: BN | null;
    endAuctionAt: BN | null;
    auctionGap: BN | null;
    priceFloor: PriceFloor;
    state: AuctionState;
    bidState: BidState;
    bidRedemptionKey?: StringPublicKey;
}
export declare class Auction extends Account<AuctionData> {
    static readonly EXTENDED_DATA_SIZE: number;
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static getPDA(vault: AnyPublicKey): Promise<PublicKey>;
    getBidderPots(connection: Connection): Promise<BidderPot[]>;
    getBidderMetadata(connection: Connection): Promise<BidderMetadata[]>;
}
