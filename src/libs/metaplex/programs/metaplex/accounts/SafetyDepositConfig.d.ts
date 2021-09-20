/// <reference types="node" />
import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { TupleNumericType } from '@metaplex/utils';
import { Account } from '../../../Account';
import { MetaplexKey } from '../MetaplexProgram';
import { Buffer } from 'buffer';
export declare enum WinningConfigType {
    TokenOnlyTransfer = 0,
    FullRightsTransfer = 1,
    PrintingV1 = 2,
    PrintingV2 = 3,
    Participation = 4
}
export declare enum WinningConstraint {
    NoParticipationPrize = 0,
    ParticipationPrizeGiven = 1
}
export declare enum NonWinningConstraint {
    NoParticipationPrize = 0,
    GivenForFixedPrice = 1,
    GivenForBidPrice = 2
}
export interface AmountRange {
    amount: BN;
    length: BN;
}
export interface ParticipationConfigV2 {
    winnerConstraint: WinningConstraint;
    nonWinningConstraint: NonWinningConstraint;
    fixedPrice: BN | null;
}
export interface ParticipationStateV2 {
    collectedToAcceptPayment: BN;
}
export interface SafetyDepositConfigData {
    key: MetaplexKey;
    auctionManager: StringPublicKey;
    order: BN;
    winningConfigType: WinningConfigType;
    amountType: TupleNumericType;
    lengthType: TupleNumericType;
    amountRanges: AmountRange[];
    participationConfig: ParticipationConfigV2 | null;
    participationState: ParticipationStateV2 | null;
}
export declare class SafetyDepositConfig extends Account<SafetyDepositConfigData> {
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static getPDA(auctionManager: AnyPublicKey, safetyDeposit: AnyPublicKey): Promise<PublicKey>;
}
