import { PublicKey } from '@solana/web3.js';
import { Program } from '../../Program';
export declare enum MetaplexKey {
    Uninitialized = 0,
    OriginalAuthorityLookupV1 = 1,
    BidRedemptionTicketV1 = 2,
    StoreV1 = 3,
    WhitelistedCreatorV1 = 4,
    PayoutTicketV1 = 5,
    SafetyDepositValidationTicketV1 = 6,
    AuctionManagerV1 = 7,
    PrizeTrackingTicketV1 = 8,
    SafetyDepositConfigV1 = 9,
    AuctionManagerV2 = 10,
    BidRedemptionTicketV2 = 11,
    AuctionWinnerTokenTypeTrackerV1 = 12
}
export declare class MetaplexProgram extends Program<{}> {
    static readonly PREFIX = "metaplex";
    static readonly PUBKEY: PublicKey;
    constructor();
}
declare const _default: MetaplexProgram;
export default _default;
