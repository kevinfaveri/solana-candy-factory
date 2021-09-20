/// <reference types="node" />
import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { AnyPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { MetaplexKey } from '../MetaplexProgram';
import { Buffer } from 'buffer';
export interface PrizeTrackingTicketData {
    key: MetaplexKey;
    metadata: string;
    supplySnapshot: BN;
    expectedRedemptions: BN;
    redemptions: BN;
}
export declare class PrizeTrackingTicket extends Account<PrizeTrackingTicketData> {
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static getPDA(auctionManager: AnyPublicKey, mint: AnyPublicKey): Promise<PublicKey>;
}
