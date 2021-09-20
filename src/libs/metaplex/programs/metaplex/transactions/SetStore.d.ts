import { PublicKey, TransactionCtorFields } from '@solana/web3.js';
import { Transaction } from '../../../Transaction';
export interface SetStoreArgs {
    instruction: number;
    public: boolean;
}
declare type SetStoreParams = {
    store: PublicKey;
    admin: PublicKey;
    isPublic: boolean;
};
export declare class SetStore extends Transaction {
    constructor(options: TransactionCtorFields, params: SetStoreParams);
}
export {};
