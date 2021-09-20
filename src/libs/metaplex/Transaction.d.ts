import { Transaction as SolanaTransaction, TransactionCtorFields } from '@solana/web3.js';
export declare class Transaction extends SolanaTransaction {
    constructor(options: TransactionCtorFields);
    static fromCombined(transactions: Transaction[]): Transaction;
}
