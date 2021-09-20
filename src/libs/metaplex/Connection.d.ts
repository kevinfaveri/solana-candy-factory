import { Commitment, Connection as SolanaConnection } from '@solana/web3.js';
export declare enum ChainId {
    MainnetBeta = 101,
    Testnet = 102,
    Devnet = 103
}
export declare const ENV: Record<string, {
    endpoint: string;
    ChainId: ChainId;
}>;
export declare class Connection extends SolanaConnection {
    constructor(endpoint?: keyof typeof ENV | string, commitment?: Commitment);
}
