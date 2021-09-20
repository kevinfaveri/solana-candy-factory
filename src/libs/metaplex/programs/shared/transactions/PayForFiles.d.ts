/// <reference types="node" />
import { Transaction } from '../../../Transaction';
import { PublicKey, TransactionCtorFields } from '@solana/web3.js';
import { Buffer } from 'buffer';
declare type PayForFilesParams = {
    lamports: number;
    fileHashes: Buffer[];
    arweaveWallet?: PublicKey;
};
export declare class PayForFiles extends Transaction {
    constructor(options: TransactionCtorFields, params: PayForFilesParams);
}
export {};
