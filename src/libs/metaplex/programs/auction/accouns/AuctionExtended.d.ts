/// <reference types="node" />
import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { AnyPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { Buffer } from 'buffer';
export interface AuctionDataExtended {
    totalUncancelledBids: BN;
    tickSize: BN | null;
    gapTickSizePercentage: number | null;
}
export declare class AuctionExtended extends Account<AuctionDataExtended> {
    static readonly DATA_SIZE: number;
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static getPDA(vault: AnyPublicKey): Promise<PublicKey>;
}
