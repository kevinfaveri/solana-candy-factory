/// <reference types="node" />
import { Buffer } from 'buffer';
export declare const extendBorsh: () => void;
export declare class Struct<T> {
    readonly fields: any;
    readonly dependencies: Struct<any>[];
    readonly type: any;
    readonly schema: Map<any, any>;
    constructor(fields: any[][], dependencies?: Struct<any>[], parse?: (args: T) => T);
    static create<T>(fields: any[][], dependencies?: Struct<any>[], parse?: (args: T) => T): Struct<T>;
    serialize(struct: T): Buffer;
    deserialize(buffer: Buffer): T;
}
export declare const struct: typeof Struct.create;
