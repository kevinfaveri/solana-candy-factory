import { PublicKey } from '@solana/web3.js';
import { Program } from '../../Program';
export declare enum NFTPacksAccountType {
    Uninitialized = 0,
    PackSet = 1,
    PackCard = 2,
    PackVoucher = 3,
    ProvingProcess = 4
}
export declare class NFTPacksProgram extends Program<{}> {
    static readonly PREFIX = "packs";
    static readonly PUBKEY: PublicKey;
    constructor();
}
declare const _default: NFTPacksProgram;
export default _default;
