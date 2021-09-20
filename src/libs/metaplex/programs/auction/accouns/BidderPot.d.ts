/// <reference types="node" />
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { AccountInfo } from '@solana/web3.js';
import { Account } from '../../../Account';
import { Buffer } from 'buffer';
export interface BiddePotData {
    bidderPot: StringPublicKey;
    bidderAct: StringPublicKey;
    auctionAct: StringPublicKey;
    emptied: boolean;
}
export declare class BidderPot extends Account<BiddePotData> {
    static readonly DATA_SIZE: number;
    readonly PROGRAM: import("../AuctionProgram").AuctionProgram;
    constructor(key: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
}
