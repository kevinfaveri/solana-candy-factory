import BN from 'bn.js';
export declare enum TupleNumericType {
    U8 = 1,
    U16 = 2,
    U32 = 4,
    U64 = 8
}
export declare const getBNFromData: (data: Uint8Array, offset: number, dataType: TupleNumericType) => BN;
