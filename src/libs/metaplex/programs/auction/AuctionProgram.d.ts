import { PublicKey } from '@solana/web3.js';
import { Program } from '../../Program';
export declare class AuctionProgram extends Program<{}> {
    static readonly PREFIX = "auction";
    static readonly EXTENDED = "extended";
    static readonly PUBKEY: PublicKey;
    constructor();
}
declare const _default: AuctionProgram;
export default _default;
