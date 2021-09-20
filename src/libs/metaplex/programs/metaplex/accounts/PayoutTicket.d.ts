/// <reference types="node" />
import { AccountInfo, Connection } from '@solana/web3.js';
import BN from 'bn.js';
import { AnyPublicKey, StringPublicKey } from '@metaplex/types';
import { Account } from '../../../Account';
import { MetaplexKey } from '../MetaplexProgram';
import { Buffer } from 'buffer';
export interface PayoutTicketData {
    key: MetaplexKey;
    recipient: StringPublicKey;
    amountPaid: BN;
}
export declare class PayoutTicket extends Account<PayoutTicketData> {
    constructor(pubkey: AnyPublicKey, info: AccountInfo<Buffer>);
    static isCompatible(data: Buffer): boolean;
    static getPayoutTicketsByRecipient(connection: Connection, recipient: AnyPublicKey): Promise<PayoutTicket[]>;
}
