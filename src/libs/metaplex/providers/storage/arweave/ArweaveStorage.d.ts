/// <reference types="node" />
import { Storage, UploadResult } from '../Storage';
import { Buffer } from 'buffer';
export interface ArweaveStorageCtorFields {
    endpoint: string;
    env: 'mainnet-beta' | 'testnet' | 'devnet';
}
export declare class ArweaveStorage implements Storage {
    readonly endpoint: string;
    readonly env: string;
    constructor({ endpoint, env }: ArweaveStorageCtorFields);
    getAssetCostToStore(files: Map<string, Buffer>, arweaveRate: number, solanaRate: number): Promise<number>;
    upload(files: Map<string, Buffer>, mintKey: string, txid: string): Promise<UploadResult>;
}
