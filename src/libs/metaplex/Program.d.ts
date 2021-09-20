/// <reference types="node" />
import { PublicKey, Connection, GetProgramAccountsConfig, Commitment } from '@solana/web3.js';
import { Account } from './Account';
import { Buffer } from 'buffer';
export declare abstract class Program<T> extends Account<T> {
    findProgramAddress(seeds: (Buffer | Uint8Array)[]): Promise<PublicKey>;
    getProgramAccounts(connection: Connection, configOrCommitment?: GetProgramAccountsConfig | Commitment): Promise<Account<unknown>[]>;
}
