import { PublicKey } from '@solana/web3.js';
export declare type StringPublicKey = string;
export declare type AnyPublicKey = StringPublicKey | PublicKey;
export declare type MetaDataJsonCategory = 'image' | 'video' | 'audio' | 'vr';
export declare type MetadataJsonAttribute = {
    trait_type: string;
    value: string;
};
export declare type MetadataJsonCollection = {
    name: string;
    family: string;
};
export declare type MetadataJsonFile = {
    uri: string;
    type: string;
    cdn?: boolean;
};
export declare type MetadataJsonCreator = {
    address: StringPublicKey;
    verified: boolean;
    share: number;
};
export declare type MetadataJsonProperties = {
    files: MetadataJsonFile[];
    category: MetaDataJsonCategory;
    creators: MetadataJsonCreator[];
};
export declare type MetadataJson = {
    name: string;
    symbol: string;
    description: string;
    seller_fee_basis_points: number;
    image: string;
    animation_url?: string;
    external_url?: string;
    attributes?: MetadataJsonAttribute[];
    collection?: MetadataJsonCollection;
    properties: MetadataJsonProperties;
};
