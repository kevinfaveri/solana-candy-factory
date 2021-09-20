/// <reference types="node" />
import { AccountInfo, Connection } from '@solana/web3.js';
import { PackCard } from './PackCard';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { NFTPacksAccountType } from '../NFTPacksProgram';
import { Buffer } from 'buffer';
export declare enum PackSetState {
    NotActivated = 0,
    Activated = 1,
    Deactivated = 2
}
export interface PackSetData {
    accountType: NFTPacksAccountType;
    name: string;
    authority: StringPublicKey;
    mintingAuthority: StringPublicKey;
    totalPacks: number;
    packCards: number;
    packVouchers: number;
    mutable: boolean;
    state: PackSetState;
}
export declare class PackSet extends Account<PackSetData> {
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    getCards(connection: Connection): Promise<PackCard[]>;
}
