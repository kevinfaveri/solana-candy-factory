import { PublicKey } from '@solana/web3.js';
import { Program } from '../../Program';
export declare enum VaultKey {
    Uninitialized = 0,
    VaultV1 = 3,
    SafetyDepositBoxV1 = 1,
    ExternalPriceAccountV1 = 2
}
export declare class VaultProgram extends Program<{}> {
    static readonly PREFIX = "vault";
    static readonly PUBKEY: PublicKey;
    constructor();
}
declare const _default: VaultProgram;
export default _default;
