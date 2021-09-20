/// <reference types="node" />
import { AccountInfo } from '@solana/web3.js';
import BN from 'bn.js';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { MetaplexKey } from '../MetaplexProgram';
import { Buffer } from 'buffer';
export interface BidRedemptionTicketV2Data {
    key: MetaplexKey;
    winnerIndex?: BN;
    auctionManager: StringPublicKey;
    data: number[];
}
export declare const WINNER_INDEX_OFFSETS: number[];
export declare class BidRedemptionTicket extends Account<BidRedemptionTicketV2Data> {
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static isBidRedemptionTicketV1(data: Buffer): boolean;
    static isBidRedemptionTicketV2(data: Buffer): boolean;
}
