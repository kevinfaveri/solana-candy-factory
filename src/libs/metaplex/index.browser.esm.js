import { PublicKey, clusterApiUrl, Connection as Connection$1, Transaction as Transaction$1, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { BinaryReader, BinaryWriter, serialize, deserializeUnchecked } from 'borsh';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { sha256 } from 'crypto-hash';
import BN from 'bn.js';
import axios from 'axios';
import { TOKEN_PROGRAM_ID, MintLayout, Token, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

const extendBorsh = () => {
    BinaryReader.prototype.readPubkey = function () {
        const reader = this;
        const array = reader.readFixedArray(32);
        return new PublicKey(array);
    };
    BinaryWriter.prototype.writePubkey = function (value) {
        const writer = this;
        writer.writeFixedArray(value.toBuffer());
    };
    BinaryReader.prototype.readPubkeyAsString = function () {
        const reader = this;
        const array = reader.readFixedArray(32);
        return bs58.encode(array);
    };
    BinaryWriter.prototype.writePubkeyAsString = function (value) {
        const writer = this;
        writer.writeFixedArray(bs58.decode(value));
    };
};
extendBorsh();
class Struct {
    constructor(fields, dependencies = [], parse) {
        this.dependencies = [];
        this.fields = fields;
        this.dependencies = dependencies;
        this.type = class Type {
            constructor(args = {}) {
                for (const [name] of fields) {
                    if (!(name in args)) {
                        args[name] = undefined;
                    }
                }
                parse && parse(args);
                for (const key of Object.keys(args)) {
                    this[key] = args[key];
                }
            }
        };
        const entries = [
            [
                this.type,
                {
                    kind: 'struct',
                    fields,
                },
            ],
        ];
        for (const d of this.dependencies)
            entries.push(...d.schema.entries());
        this.schema = new Map(entries);
    }
    static create(fields, dependencies = [], parse) {
        return new Struct(fields, dependencies, parse);
    }
    serialize(struct) {
        return Buffer.from(serialize(this.schema, new this.type(struct)));
    }
    deserialize(buffer) {
        return deserializeUnchecked(this.schema, this.type, buffer);
    }
}
const struct = Struct.create;

var borsh = /*#__PURE__*/Object.freeze({
  __proto__: null,
  extendBorsh: extendBorsh,
  Struct: Struct,
  struct: struct
});

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const getFileHash = (file) => __awaiter(void 0, void 0, void 0, function* () { return Buffer.from(yield sha256(file.toString())); });

var crypto = /*#__PURE__*/Object.freeze({
  __proto__: null,
  getFileHash: getFileHash
});

var TupleNumericType;
(function (TupleNumericType) {
    TupleNumericType[TupleNumericType["U8"] = 1] = "U8";
    TupleNumericType[TupleNumericType["U16"] = 2] = "U16";
    TupleNumericType[TupleNumericType["U32"] = 4] = "U32";
    TupleNumericType[TupleNumericType["U64"] = 8] = "U64";
})(TupleNumericType || (TupleNumericType = {}));
const getBNFromData = (data, offset, dataType) => {
    switch (dataType) {
        case TupleNumericType.U8:
            return new BN(data[offset], 'le');
        case TupleNumericType.U16:
            return new BN(data.slice(offset, offset + 2), 'le');
        case TupleNumericType.U32:
            return new BN(data.slice(offset, offset + 4), 'le');
        case TupleNumericType.U64:
            return new BN(data.slice(offset, offset + 8), 'le');
    }
};

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  borsh: borsh,
  crypto: crypto,
  get TupleNumericType () { return TupleNumericType; },
  getBNFromData: getBNFromData
});

var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["ERROR_INVALID_OWNER"] = 0] = "ERROR_INVALID_OWNER";
    ErrorCode[ErrorCode["ERROR_INVALID_ACCOUNT_DATA"] = 1] = "ERROR_INVALID_ACCOUNT_DATA";
    ErrorCode[ErrorCode["ERROR_DEPRECATED_ACCOUNT_DATA"] = 2] = "ERROR_DEPRECATED_ACCOUNT_DATA";
})(ErrorCode || (ErrorCode = {}));
class MetaplexError extends Error {
    constructor(errorCode, message) {
        super(message);
        this.errorCode = errorCode;
    }
}
const ERROR_INVALID_OWNER = () => {
    return new MetaplexError(ErrorCode.ERROR_INVALID_OWNER, 'Invalid owner');
};
const ERROR_INVALID_ACCOUNT_DATA = () => {
    return new MetaplexError(ErrorCode.ERROR_INVALID_ACCOUNT_DATA, 'Invalid data');
};
const ERROR_DEPRECATED_ACCOUNT_DATA = () => {
    return new MetaplexError(ErrorCode.ERROR_DEPRECATED_ACCOUNT_DATA, 'Account data is deprecated');
};

var errors = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get ErrorCode () { return ErrorCode; },
  MetaplexError: MetaplexError,
  ERROR_INVALID_OWNER: ERROR_INVALID_OWNER,
  ERROR_INVALID_ACCOUNT_DATA: ERROR_INVALID_ACCOUNT_DATA,
  ERROR_DEPRECATED_ACCOUNT_DATA: ERROR_DEPRECATED_ACCOUNT_DATA
});

var Currency;
(function (Currency) {
    Currency["USD"] = "usd";
    Currency["EUR"] = "eur";
    Currency["AR"] = "ar";
    Currency["SOL"] = "sol";
})(Currency || (Currency = {}));
class ConversionRateProvider {
}

class Coingecko {
    constructor() { }
    static translateCurrency(currency) {
        switch (currency) {
            case Currency.AR:
                return 'arweave';
            case Currency.SOL:
                return 'solana';
            case Currency.USD:
                return 'usd';
            case Currency.EUR:
                return 'eur';
            default:
                throw new Error('Invalid currency supplied to Coingecko conversion rate provider');
        }
    }
    getRate(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const fromArray = typeof from === 'string' ? [from] : from;
            const toArray = typeof to === 'string' ? [to] : to;
            const fromIds = fromArray.map((currency) => Coingecko.translateCurrency(currency)).join(',');
            const toIds = toArray.map((currency) => Coingecko.translateCurrency(currency)).join(',');
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromIds}&vs_currencies=${toIds}`;
            const response = yield axios(url);
            const data = yield response.data;
            return fromArray.reduce((previousPairs, fromCurrency) => {
                return [
                    ...previousPairs,
                    ...toArray.map((toCurrency) => ({
                        from: fromCurrency,
                        to: toCurrency,
                        rate: data[Coingecko.translateCurrency(fromCurrency)][Coingecko.translateCurrency(toCurrency)],
                    })),
                ];
            }, []);
        });
    }
}

const ARWEAVE_URL = 'https://arweave.net';
const LAMPORT_MULTIPLIER = Math.pow(10, 9);
const WINSTON_MULTIPLIER = Math.pow(10, 12);
class ArweaveStorage {
    constructor({ endpoint, env }) {
        this.endpoint = endpoint;
        this.env = env;
    }
    getAssetCostToStore(files, arweaveRate, solanaRate) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffers = Array.from(files.values());
            const totalBytes = buffers.reduce((sum, f) => (sum += f.byteLength), 0);
            const txnFeeInWinstons = parseInt(yield (yield axios(`${ARWEAVE_URL}/price/0`)).data);
            const byteCostInWinstons = parseInt(yield (yield axios(`${ARWEAVE_URL}/price/${totalBytes.toString()}`)).data);
            const totalArCost = (txnFeeInWinstons * buffers.length + byteCostInWinstons) / WINSTON_MULTIPLIER;
            const arMultiplier = arweaveRate / solanaRate;
            return LAMPORT_MULTIPLIER * totalArCost * arMultiplier * 1.1;
        });
    }
    upload(files, mintKey, txid) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileEntries = Array.from(files.entries());
            fileEntries.reduce((acc, f) => {
                acc[f[0]] = [{ name: 'mint', value: mintKey }];
                return acc;
            }, {});
            return {};
        });
    }
}

var ChainId;
(function (ChainId) {
    ChainId[ChainId["MainnetBeta"] = 101] = "MainnetBeta";
    ChainId[ChainId["Testnet"] = 102] = "Testnet";
    ChainId[ChainId["Devnet"] = 103] = "Devnet";
})(ChainId || (ChainId = {}));
const ENV = {
    'mainnet-beta': {
        endpoint: 'https://api.metaplex.solana.com/',
        ChainId: ChainId.MainnetBeta,
    },
    'mainnet-beta (Solana)': {
        endpoint: 'https://api.mainnet-beta.solana.com',
        ChainId: ChainId.MainnetBeta,
    },
    'mainnet-beta (Serum)': {
        endpoint: 'https://solana-api.projectserum.com/',
        ChainId: ChainId.MainnetBeta,
    },
    testnet: {
        endpoint: clusterApiUrl('testnet'),
        ChainId: ChainId.Testnet,
    },
    devnet: {
        endpoint: clusterApiUrl('devnet'),
        ChainId: ChainId.Devnet,
    },
};
class Connection extends Connection$1 {
    constructor(endpoint = 'mainnet-beta', commitment) {
        if (endpoint in ENV)
            endpoint = ENV[endpoint].endpoint;
        super(endpoint, commitment);
    }
}

class Account {
    constructor(pubkey, info) {
        this.pubkey = new PublicKey(pubkey);
        this.info = info;
    }
    static from(account) {
        return new this(account.pubkey, account.info);
    }
    static load(connection, pubkey) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield Account.getInfo(connection, pubkey);
            return new this(pubkey, info);
        });
    }
    static isCompatible(data) {
        throw new Error(`method 'isCompatible' is not implemented`);
    }
    static getInfo(connection, pubkey) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield connection.getAccountInfo(new PublicKey(pubkey));
            if (!info) {
                throw new Error(`Unable to find account: ${pubkey}`);
            }
            return Object.assign(Object.assign({}, info), { data: Buffer.from(info === null || info === void 0 ? void 0 : info.data) });
        });
    }
    static getInfos(connection, pubkeys, commitment = 'recent') {
        return __awaiter(this, void 0, void 0, function* () {
            const BATCH_SIZE = 99;
            const promises = [];
            for (let i = 0; i < pubkeys.length; i += BATCH_SIZE) {
                promises.push(Account.getMultipleAccounts(connection, pubkeys.slice(i, Math.min(pubkeys.length, i + BATCH_SIZE)), commitment));
            }
            const results = new Map();
            (yield Promise.all(promises)).forEach((result) => { var _a; return [...((_a = result === null || result === void 0 ? void 0 : result.entries()) !== null && _a !== void 0 ? _a : [])].forEach(([k, v]) => results.set(k, v)); });
            return results;
        });
    }
    static getMultipleAccounts(connection, pubkeys, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = connection._buildArgs([pubkeys.map((k) => k.toString())], commitment, 'base64');
            const unsafeRes = yield connection._rpcRequest('getMultipleAccounts', args);
            if (unsafeRes.error) {
                throw new Error('failed to get info about accounts ' + unsafeRes.error.message);
            }
            if (!unsafeRes.result.value)
                return;
            const infos = unsafeRes.result.value.map((info) => (Object.assign(Object.assign({}, info), { data: Buffer.from(info.data[0], 'base64') })));
            return infos.reduce((acc, info, index) => {
                acc.set(pubkeys[index], info);
                return acc;
            }, new Map());
        });
    }
    assertOwner(pubkey) {
        var _a;
        return (_a = this.info) === null || _a === void 0 ? void 0 : _a.owner.equals(new PublicKey(pubkey));
    }
    toJSON() {
        var _a, _b, _c, _d, _e;
        return {
            pubkey: this.pubkey.toString(),
            info: {
                executable: !!((_a = this.info) === null || _a === void 0 ? void 0 : _a.executable),
                owner: ((_b = this.info) === null || _b === void 0 ? void 0 : _b.owner) ? new PublicKey((_c = this.info) === null || _c === void 0 ? void 0 : _c.owner) : null,
                lamports: (_d = this.info) === null || _d === void 0 ? void 0 : _d.lamports,
                data: (_e = this.info) === null || _e === void 0 ? void 0 : _e.data.toJSON(),
            },
            data: this.data,
        };
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
}

const config = {
    arweaveWallet: 'HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm',
    programs: {
        auction: 'auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8',
        metadata: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
        metaplex: 'p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98',
        vault: 'vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn',
        memo: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
    },
};

class Program$5 extends Account {
    findProgramAddress(seeds) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield PublicKey.findProgramAddress(seeds, this.pubkey))[0];
        });
    }
    getProgramAccounts(connection, configOrCommitment) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield connection.getProgramAccounts(this.pubkey, configOrCommitment)).map(({ pubkey, account }) => new Account(pubkey, account));
        });
    }
}

class AuctionProgram extends Program$5 {
    constructor() {
        super(AuctionProgram.PUBKEY);
    }
}
AuctionProgram.PREFIX = 'auction';
AuctionProgram.EXTENDED = 'extended';
AuctionProgram.PUBKEY = new PublicKey(config.programs.auction);
var Program$4 = new AuctionProgram();

const bidderMetadataStruct = struct([
    ['bidderPubkey', 'pubkeyAsString'],
    ['auctionPubkey', 'pubkeyAsString'],
    ['lastBid', 'u64'],
    ['lastBidTimestamp', 'u64'],
    ['cancelled', 'u8'],
]);
class BidderMetadata extends Account {
    constructor(key, info) {
        super(key, info);
        if (!this.assertOwner(Program$4.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!BidderMetadata.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = bidderMetadataStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data.length === BidderMetadata.DATA_SIZE;
    }
}
BidderMetadata.DATA_SIZE = 32 + 32 + 8 + 8 + 1;

const bidderPotStruct = struct([
    ['bidderPot', 'pubkeyAsString'],
    ['bidderAct', 'pubkeyAsString'],
    ['auctionAct', 'pubkeyAsString'],
    ['emptied', 'u8'],
]);
class BidderPot extends Account {
    constructor(key, info) {
        super(key, info);
        this.PROGRAM = Program$4;
        if (!this.assertOwner(Program$4.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!BidderPot.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = bidderPotStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data.length === BidderPot.DATA_SIZE;
    }
}
BidderPot.DATA_SIZE = 32 + 32 + 32 + 1;

var AuctionState;
(function (AuctionState) {
    AuctionState[AuctionState["Created"] = 0] = "Created";
    AuctionState[AuctionState["Started"] = 1] = "Started";
    AuctionState[AuctionState["Ended"] = 2] = "Ended";
})(AuctionState || (AuctionState = {}));
var BidStateType;
(function (BidStateType) {
    BidStateType[BidStateType["EnglishAuction"] = 0] = "EnglishAuction";
    BidStateType[BidStateType["OpenEdition"] = 1] = "OpenEdition";
})(BidStateType || (BidStateType = {}));
var PriceFloorType;
(function (PriceFloorType) {
    PriceFloorType[PriceFloorType["None"] = 0] = "None";
    PriceFloorType[PriceFloorType["Minimum"] = 1] = "Minimum";
    PriceFloorType[PriceFloorType["BlindedPrice"] = 2] = "BlindedPrice";
})(PriceFloorType || (PriceFloorType = {}));
const bidStruct = struct([
    ['key', 'pubkeyAsString'],
    ['amount', 'u64'],
]);
const bidStateStruct = struct([
    ['type', 'u8'],
    ['bids', [bidStruct.type]],
    ['max', 'u64'],
], [bidStruct]);
const priceFloorStruct = struct([
    ['type', 'u8'],
    ['hash', [32]],
], [], (data) => {
    if (!data.hash)
        data.hash = new Uint8Array(32);
    if (data.type === PriceFloorType.Minimum) {
        if (data.minPrice) {
            data.hash.set(data.minPrice.toArrayLike(Buffer, 'le', 8), 0);
        }
        else {
            data.minPrice = new BN((data.hash || new Uint8Array(0)).slice(0, 8), 'le');
        }
    }
    return data;
});
const auctionDataStruct = struct([
    ['authority', 'pubkeyAsString'],
    ['tokenMint', 'pubkeyAsString'],
    ['lastBid', { kind: 'option', type: 'u64' }],
    ['endedAt', { kind: 'option', type: 'u64' }],
    ['endAuctionAt', { kind: 'option', type: 'u64' }],
    ['auctionGap', { kind: 'option', type: 'u64' }],
    ['priceFloor', priceFloorStruct.type],
    ['state', 'u8'],
    ['bidState', bidStateStruct.type],
], [priceFloorStruct, bidStateStruct]);
class Auction extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$4.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        this.data = auctionDataStruct.deserialize(this.info.data);
    }
    static getPDA(vault) {
        return Program$4.findProgramAddress([
            Buffer.from(AuctionProgram.PREFIX),
            AuctionProgram.PUBKEY.toBuffer(),
            new PublicKey(vault).toBuffer(),
        ]);
    }
    getBidderPots(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Program$4.getProgramAccounts(connection, {
                filters: [
                    {
                        dataSize: BidderPot.DATA_SIZE,
                    },
                    {
                        memcmp: {
                            offset: 32 + 32,
                            bytes: this.pubkey.toBase58(),
                        },
                    },
                ],
            })).map((account) => BidderPot.from(account));
        });
    }
    getBidderMetadata(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Program$4.getProgramAccounts(connection, {
                filters: [
                    {
                        dataSize: BidderMetadata.DATA_SIZE,
                    },
                    {
                        memcmp: {
                            offset: 32,
                            bytes: this.pubkey.toBase58(),
                        },
                    },
                ],
            })).map((account) => BidderMetadata.from(account));
        });
    }
}
Auction.EXTENDED_DATA_SIZE = 8 + 9 + 2 + 200;

const auctionDataExtendedStruct = struct([
    ['totalUncancelledBids', 'u64'],
    ['tickSize', { kind: 'option', type: 'u64' }],
    ['gapTickSizePercentage', { kind: 'option', type: 'u8' }],
]);
class AuctionExtended extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$4.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!AuctionExtended.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = auctionDataExtendedStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data.length === AuctionExtended.DATA_SIZE;
    }
    static getPDA(vault) {
        return Program$4.findProgramAddress([
            Buffer.from(AuctionProgram.PREFIX),
            AuctionProgram.PUBKEY.toBuffer(),
            new PublicKey(vault).toBuffer(),
            Buffer.from(AuctionProgram.EXTENDED),
        ]);
    }
}
AuctionExtended.DATA_SIZE = 8 + 9 + 2 + 200;

var MetadataKey;
(function (MetadataKey) {
    MetadataKey[MetadataKey["Uninitialized"] = 0] = "Uninitialized";
    MetadataKey[MetadataKey["MetadataV1"] = 4] = "MetadataV1";
    MetadataKey[MetadataKey["EditionV1"] = 1] = "EditionV1";
    MetadataKey[MetadataKey["MasterEditionV1"] = 2] = "MasterEditionV1";
    MetadataKey[MetadataKey["MasterEditionV2"] = 6] = "MasterEditionV2";
    MetadataKey[MetadataKey["EditionMarker"] = 7] = "EditionMarker";
})(MetadataKey || (MetadataKey = {}));
class MetadataProgram extends Program$5 {
    constructor() {
        super(MetadataProgram.PUBKEY);
    }
}
MetadataProgram.PREFIX = 'metadata';
MetadataProgram.PUBKEY = new PublicKey(config.programs.metadata);
var Program$3 = new MetadataProgram();

const editionStruct = struct([
    ['key', 'u8'],
    ['parent', 'pubkeyAsString'],
    ['edition', 'u64'],
], [], (data) => {
    data.key = MetadataKey.EditionV1;
    return data;
});
class Edition extends Account {
    constructor(key, info) {
        super(key, info);
        if (!this.assertOwner(Program$3.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!Edition.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = editionStruct.deserialize(this.info.data);
    }
    static getPDA(mint) {
        return __awaiter(this, void 0, void 0, function* () {
            return Program$3.findProgramAddress([
                Buffer.from(MetadataProgram.PREFIX),
                MetadataProgram.PUBKEY.toBuffer(),
                new PublicKey(mint).toBuffer(),
                Buffer.from(Edition.EDITION_PREFIX),
            ]);
        });
    }
    static isCompatible(data) {
        return data[0] === MetadataKey.EditionV1;
    }
}
Edition.EDITION_PREFIX = 'edition';

const editionMarkerStruct = struct([
    ['key', 'u8'],
    ['ledger', [31]],
], [], (data) => {
    data.key = MetadataKey.EditionMarker;
    return data;
});
class EditionMarker extends Account {
    constructor(key, info) {
        super(key, info);
        if (!this.assertOwner(Program$3.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!EditionMarker.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = editionMarkerStruct.deserialize(this.info.data);
    }
    static getPDA(mint, edition) {
        return __awaiter(this, void 0, void 0, function* () {
            const editionNumber = Math.floor(edition.toNumber() / 248);
            return Program$3.findProgramAddress([
                Buffer.from(MetadataProgram.PREFIX),
                MetadataProgram.PUBKEY.toBuffer(),
                new PublicKey(mint).toBuffer(),
                Buffer.from(Edition.EDITION_PREFIX),
                Buffer.from(editionNumber.toString()),
            ]);
        });
    }
    static isCompatible(data) {
        return data[0] === MetadataKey.EditionMarker;
    }
}

const masterEditionV2Struct = struct([
    ['key', 'u8'],
    ['supply', 'u64'],
    ['maxSupply', { kind: 'option', type: 'u64' }],
], [], (data) => {
    data.key = MetadataKey.MasterEditionV2;
    return data;
});
const masterEditionV1Struct = struct([
    ...masterEditionV2Struct.fields,
    ['printingMint', 'pubkeyAsString'],
    ['oneTimePrintingAuthorizationMint', 'pubkeyAsString'],
], [], (data) => {
    data.key = MetadataKey.MasterEditionV1;
    return data;
});
class MasterEdition extends Account {
    constructor(key, info) {
        super(key, info);
        if (!this.assertOwner(Program$3.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (MasterEdition.isMasterEditionV1(this.info.data)) {
            this.data = masterEditionV1Struct.deserialize(this.info.data);
        }
        else if (MasterEdition.isMasterEditionV2(this.info.data)) {
            this.data = masterEditionV2Struct.deserialize(this.info.data);
        }
        else {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
    }
    static getPDA(mint) {
        return __awaiter(this, void 0, void 0, function* () {
            return Program$3.findProgramAddress([
                Buffer.from(MetadataProgram.PREFIX),
                MetadataProgram.PUBKEY.toBuffer(),
                new PublicKey(mint).toBuffer(),
                Buffer.from(MasterEdition.EDITION_PREFIX),
            ]);
        });
    }
    static isCompatible(data) {
        return MasterEdition.isMasterEditionV1(data) || MasterEdition.isMasterEditionV2(data);
    }
    static isMasterEditionV1(data) {
        return data[0] === MetadataKey.MasterEditionV1;
    }
    static isMasterEditionV2(data) {
        return data[0] === MetadataKey.MasterEditionV2;
    }
    getEditions(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Program$3.getProgramAccounts(connection, {
                filters: [
                    {
                        memcmp: {
                            offset: 0,
                            bytes: bs58.encode(Buffer.from([MetadataKey.EditionV1])),
                        },
                    },
                    {
                        memcmp: {
                            offset: 1,
                            bytes: this.pubkey.toBase58(),
                        },
                    },
                ],
            })).map((account) => Edition.from(account));
        });
    }
}
MasterEdition.EDITION_PREFIX = 'edition';

const creatorStruct = struct([
    ['address', 'pubkeyAsString'],
    ['verified', 'u8'],
    ['share', 'u8'],
]);
const dataDataStruct = struct([
    ['name', 'string'],
    ['symbol', 'string'],
    ['uri', 'string'],
    ['sellerFeeBasisPoints', 'u16'],
    ['creators', { kind: 'option', type: [creatorStruct.type] }],
], [creatorStruct], (data) => {
    const METADATA_REPLACE = new RegExp('\u0000', 'g');
    data.name = data.name.replace(METADATA_REPLACE, '');
    data.uri = data.uri.replace(METADATA_REPLACE, '');
    data.symbol = data.symbol.replace(METADATA_REPLACE, '');
    return data;
});
const dataStruct = struct([
    ['key', 'u8'],
    ['updateAuthority', 'pubkeyAsString'],
    ['mint', 'pubkeyAsString'],
    ['data', dataDataStruct.type],
    ['primarySaleHappened', 'u8'],
    ['isMutable', 'u8'],
], [dataDataStruct]);
class Metadata extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$3.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!Metadata.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = dataStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data[0] === MetadataKey.MetadataV1;
    }
    static getPDA(mint) {
        return __awaiter(this, void 0, void 0, function* () {
            return Program$3.findProgramAddress([
                Buffer.from(MetadataProgram.PREFIX),
                MetadataProgram.PUBKEY.toBuffer(),
                new PublicKey(mint).toBuffer(),
            ]);
        });
    }
    getEdition(connection) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const mint = (_a = this.data) === null || _a === void 0 ? void 0 : _a.mint;
            if (!mint)
                return;
            const pda = yield Edition.getPDA(mint);
            const info = yield Account.getInfo(connection, pda);
            const key = info === null || info === void 0 ? void 0 : info.data[0];
            switch (key) {
                case MetadataKey.EditionV1:
                    return new Edition(pda, info);
                case MetadataKey.MasterEditionV1:
                case MetadataKey.MasterEditionV2:
                    return new MasterEdition(pda, info);
                default:
                    return;
            }
        });
    }
}

var MetaplexKey;
(function (MetaplexKey) {
    MetaplexKey[MetaplexKey["Uninitialized"] = 0] = "Uninitialized";
    MetaplexKey[MetaplexKey["OriginalAuthorityLookupV1"] = 1] = "OriginalAuthorityLookupV1";
    MetaplexKey[MetaplexKey["BidRedemptionTicketV1"] = 2] = "BidRedemptionTicketV1";
    MetaplexKey[MetaplexKey["StoreV1"] = 3] = "StoreV1";
    MetaplexKey[MetaplexKey["WhitelistedCreatorV1"] = 4] = "WhitelistedCreatorV1";
    MetaplexKey[MetaplexKey["PayoutTicketV1"] = 5] = "PayoutTicketV1";
    MetaplexKey[MetaplexKey["SafetyDepositValidationTicketV1"] = 6] = "SafetyDepositValidationTicketV1";
    MetaplexKey[MetaplexKey["AuctionManagerV1"] = 7] = "AuctionManagerV1";
    MetaplexKey[MetaplexKey["PrizeTrackingTicketV1"] = 8] = "PrizeTrackingTicketV1";
    MetaplexKey[MetaplexKey["SafetyDepositConfigV1"] = 9] = "SafetyDepositConfigV1";
    MetaplexKey[MetaplexKey["AuctionManagerV2"] = 10] = "AuctionManagerV2";
    MetaplexKey[MetaplexKey["BidRedemptionTicketV2"] = 11] = "BidRedemptionTicketV2";
    MetaplexKey[MetaplexKey["AuctionWinnerTokenTypeTrackerV1"] = 12] = "AuctionWinnerTokenTypeTrackerV1";
})(MetaplexKey || (MetaplexKey = {}));
class MetaplexProgram extends Program$5 {
    constructor() {
        super(MetaplexProgram.PUBKEY);
    }
}
MetaplexProgram.PREFIX = 'metaplex';
MetaplexProgram.PUBKEY = new PublicKey(config.programs.metaplex);
var Program$2 = new MetaplexProgram();

const WINNER_INDEX_OFFSETS = [2, 10];
class BidRedemptionTicket extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$2.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (BidRedemptionTicket.isBidRedemptionTicketV1(this.info.data)) {
            throw ERROR_DEPRECATED_ACCOUNT_DATA();
        }
        else if (BidRedemptionTicket.isBidRedemptionTicketV2(this.info.data)) {
            const data = this.info.data.toJSON().data;
            const winnerIndex = data[1] !== 0 && new BN(data.slice(1, 9), 'le');
            const offset = WINNER_INDEX_OFFSETS[+!!winnerIndex];
            this.data = {
                key: MetaplexKey.BidRedemptionTicketV2,
                winnerIndex,
                data,
                auctionManager: bs58.encode(data.slice(offset, offset + 32)),
            };
        }
        else {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
    }
    static isCompatible(data) {
        return (BidRedemptionTicket.isBidRedemptionTicketV1(data) ||
            BidRedemptionTicket.isBidRedemptionTicketV2(data));
    }
    static isBidRedemptionTicketV1(data) {
        return data[0] === MetaplexKey.BidRedemptionTicketV1;
    }
    static isBidRedemptionTicketV2(data) {
        return data[0] === MetaplexKey.BidRedemptionTicketV2;
    }
}

var AuctionManagerStatus;
(function (AuctionManagerStatus) {
    AuctionManagerStatus[AuctionManagerStatus["Initialized"] = 0] = "Initialized";
    AuctionManagerStatus[AuctionManagerStatus["Validated"] = 1] = "Validated";
    AuctionManagerStatus[AuctionManagerStatus["Running"] = 2] = "Running";
    AuctionManagerStatus[AuctionManagerStatus["Disbursing"] = 3] = "Disbursing";
    AuctionManagerStatus[AuctionManagerStatus["Finished"] = 4] = "Finished";
})(AuctionManagerStatus || (AuctionManagerStatus = {}));
const AuctionManagerStateV2Struct = struct([
    ['status', 'u8'],
    ['safetyConfigItemsValidated', 'u64'],
    ['bidsPushedToAcceptPayment', 'u64'],
    ['hasParticipation', 'u8'],
], [], (data) => Object.assign({
    status: AuctionManagerStatus.Initialized,
    safetyConfigItemsValidated: new BN(0),
    bidsPushedToAcceptPayment: new BN(0),
    hasParticipation: false,
}, data));
const AuctionManagerV2Struct = struct([
    ['key', 'u8'],
    ['store', 'pubkeyAsString'],
    ['authority', 'pubkeyAsString'],
    ['auction', 'pubkeyAsString'],
    ['vault', 'pubkeyAsString'],
    ['acceptPayment', 'pubkeyAsString'],
    ['state', AuctionManagerStateV2Struct.type],
], [AuctionManagerStateV2Struct], (data) => {
    data.key = MetaplexKey.AuctionManagerV2;
    return data;
});
class AuctionManager extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$2.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (AuctionManager.isAuctionManagerV1(this.info.data)) {
            throw ERROR_DEPRECATED_ACCOUNT_DATA();
        }
        else if (AuctionManager.isAuctionManagerV2(this.info.data)) {
            this.data = AuctionManagerV2Struct.deserialize(this.info.data);
        }
        else {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
    }
    static isCompatible(data) {
        return AuctionManager.isAuctionManagerV1(data) || AuctionManager.isAuctionManagerV2(data);
    }
    static isAuctionManagerV1(data) {
        return data[0] === MetaplexKey.AuctionManagerV1;
    }
    static isAuctionManagerV2(data) {
        return data[0] === MetaplexKey.AuctionManagerV2;
    }
    static getPDA(auction) {
        return Program$2.findProgramAddress([
            Buffer.from(MetaplexProgram.PREFIX),
            new PublicKey(auction).toBuffer(),
        ]);
    }
    getAuction(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return Auction.load(connection, this.data.auction);
        });
    }
    getBidRedemptionTickets(connection, haveWinnerIndex = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Program$2.getProgramAccounts(connection, {
                filters: [
                    {
                        memcmp: {
                            offset: 0,
                            bytes: bs58.encode(Buffer.from([MetaplexKey.BidRedemptionTicketV2])),
                        },
                    },
                    {
                        memcmp: {
                            offset: WINNER_INDEX_OFFSETS[+haveWinnerIndex],
                            bytes: this.pubkey.toBase58(),
                        },
                    },
                ],
            })).map((account) => BidRedemptionTicket.from(account));
        });
    }
}

const payoutTicketStruct = struct([
    ['key', 'u8'],
    ['recipient', 'pubkeyAsString'],
    ['amountPaid', 'u64'],
], [], (data) => {
    data.key = MetaplexKey.PayoutTicketV1;
    return data;
});
class PayoutTicket extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$2.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!PayoutTicket.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = payoutTicketStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data[0] === MetaplexKey.PayoutTicketV1;
    }
    static getPayoutTicketsByRecipient(connection, recipient) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Program$2.getProgramAccounts(connection, {
                filters: [
                    {
                        memcmp: {
                            offset: 0,
                            bytes: bs58.encode(Buffer.from([MetaplexKey.PayoutTicketV1])),
                        },
                    },
                    {
                        memcmp: {
                            offset: 1,
                            bytes: new PublicKey(recipient).toBase58(),
                        },
                    },
                ],
            })).map((account) => PayoutTicket.from(account));
        });
    }
}

const prizeTrackingTicketStruct = struct([
    ['key', 'u8'],
    ['metadata', 'pubkeyAsString'],
    ['supplySnapshot', 'u64'],
    ['expectedRedemptions', 'u64'],
    ['redemptions', 'u64'],
], [], (data) => {
    data.key = MetaplexKey.PrizeTrackingTicketV1;
    return data;
});
class PrizeTrackingTicket extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$2.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!PrizeTrackingTicket.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = prizeTrackingTicketStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data[0] === MetaplexKey.PrizeTrackingTicketV1;
    }
    static getPDA(auctionManager, mint) {
        return __awaiter(this, void 0, void 0, function* () {
            return Program$2.findProgramAddress([
                Buffer.from(MetaplexProgram.PREFIX),
                MetaplexProgram.PUBKEY.toBuffer(),
                new PublicKey(auctionManager).toBuffer(),
                new PublicKey(mint).toBuffer(),
            ]);
        });
    }
}

var WinningConfigType;
(function (WinningConfigType) {
    WinningConfigType[WinningConfigType["TokenOnlyTransfer"] = 0] = "TokenOnlyTransfer";
    WinningConfigType[WinningConfigType["FullRightsTransfer"] = 1] = "FullRightsTransfer";
    WinningConfigType[WinningConfigType["PrintingV1"] = 2] = "PrintingV1";
    WinningConfigType[WinningConfigType["PrintingV2"] = 3] = "PrintingV2";
    WinningConfigType[WinningConfigType["Participation"] = 4] = "Participation";
})(WinningConfigType || (WinningConfigType = {}));
var WinningConstraint;
(function (WinningConstraint) {
    WinningConstraint[WinningConstraint["NoParticipationPrize"] = 0] = "NoParticipationPrize";
    WinningConstraint[WinningConstraint["ParticipationPrizeGiven"] = 1] = "ParticipationPrizeGiven";
})(WinningConstraint || (WinningConstraint = {}));
var NonWinningConstraint;
(function (NonWinningConstraint) {
    NonWinningConstraint[NonWinningConstraint["NoParticipationPrize"] = 0] = "NoParticipationPrize";
    NonWinningConstraint[NonWinningConstraint["GivenForFixedPrice"] = 1] = "GivenForFixedPrice";
    NonWinningConstraint[NonWinningConstraint["GivenForBidPrice"] = 2] = "GivenForBidPrice";
})(NonWinningConstraint || (NonWinningConstraint = {}));
class SafetyDepositConfig extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$2.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!SafetyDepositConfig.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data[0] === MetaplexKey.SafetyDepositConfigV1;
    }
    static getPDA(auctionManager, safetyDeposit) {
        return __awaiter(this, void 0, void 0, function* () {
            return Program$2.findProgramAddress([
                Buffer.from(MetaplexProgram.PREFIX),
                MetaplexProgram.PUBKEY.toBuffer(),
                new PublicKey(auctionManager).toBuffer(),
                new PublicKey(safetyDeposit).toBuffer(),
            ]);
        });
    }
}
const deserialize = (buffer) => {
    const data = {
        key: MetaplexKey.SafetyDepositConfigV1,
        auctionManager: bs58.encode(buffer.slice(1, 33)),
        order: new BN(buffer.slice(33, 41), 'le'),
        winningConfigType: buffer[41],
        amountType: buffer[42],
        lengthType: buffer[43],
        amountRanges: [],
        participationConfig: null,
        participationState: null,
    };
    const lengthOfArray = new BN(buffer.slice(44, 48), 'le');
    let offset = 48;
    for (let i = 0; i < lengthOfArray.toNumber(); i++) {
        const amount = getBNFromData(buffer, offset, data.amountType);
        offset += data.amountType;
        const length = getBNFromData(buffer, offset, data.lengthType);
        offset += data.lengthType;
        data.amountRanges.push({ amount, length });
    }
    if (buffer[offset] == 0) {
        offset += 1;
        data.participationConfig = null;
    }
    else {
        const winnerConstraint = buffer[offset + 1];
        const nonWinningConstraint = buffer[offset + 2];
        let fixedPrice = null;
        offset += 3;
        if (buffer[offset] == 1) {
            fixedPrice = new BN(buffer.slice(offset + 1, offset + 9), 'le');
            offset += 9;
        }
        else {
            offset += 1;
        }
        data.participationConfig = {
            winnerConstraint,
            nonWinningConstraint,
            fixedPrice,
        };
    }
    if (buffer[offset] == 0) {
        offset += 1;
        data.participationState = null;
    }
    else {
        const collectedToAcceptPayment = new BN(buffer.slice(offset + 1, offset + 9), 'le');
        offset += 9;
        data.participationState = {
            collectedToAcceptPayment,
        };
    }
    return data;
};

const whitelistedCreatorStruct = struct([
    ['key', 'u8'],
    ['address', 'pubkeyAsString'],
    ['activated', 'u8'],
], [], (data) => Object.assign({ activated: true }, data, {
    key: MetaplexKey.WhitelistedCreatorV1,
}));
class WhitelistedCreator extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$2.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!WhitelistedCreator.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = whitelistedCreatorStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data[0] === MetaplexKey.WhitelistedCreatorV1;
    }
    static getPDA(store, creator) {
        return __awaiter(this, void 0, void 0, function* () {
            return Program$2.findProgramAddress([
                Buffer.from(MetaplexProgram.PREFIX),
                MetaplexProgram.PUBKEY.toBuffer(),
                new PublicKey(store).toBuffer(),
                new PublicKey(creator).toBuffer(),
            ]);
        });
    }
}

const storeStruct = struct([
    ['key', 'u8'],
    ['public', 'u8'],
    ['auctionProgram', 'pubkeyAsString'],
    ['tokenVaultProgram', 'pubkeyAsString'],
    ['tokenMetadataProgram', 'pubkeyAsString'],
    ['tokenProgram', 'pubkeyAsString'],
], [], (data) => Object.assign({ public: true }, data, { key: MetaplexKey.StoreV1 }));
class Store extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$2.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!Store.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = storeStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data[0] === MetaplexKey.StoreV1;
    }
    static getPDA(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            return Program$2.findProgramAddress([
                Buffer.from(MetaplexProgram.PREFIX),
                MetaplexProgram.PUBKEY.toBuffer(),
                new PublicKey(owner).toBuffer(),
            ]);
        });
    }
    getWhitelistedCreators(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Program$2.getProgramAccounts(connection, {
                filters: [
                    {
                        memcmp: {
                            offset: 0,
                            bytes: bs58.encode(Buffer.from([MetaplexKey.WhitelistedCreatorV1])),
                        },
                    },
                ],
            })).map((account) => WhitelistedCreator.from(account));
        });
    }
    getAuctionManagers(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Program$2.getProgramAccounts(connection, {
                filters: [
                    {
                        memcmp: {
                            offset: 0,
                            bytes: bs58.encode(Buffer.from([MetaplexKey.AuctionManagerV2])),
                        },
                    },
                    {
                        memcmp: {
                            offset: 1,
                            bytes: this.pubkey.toBase58(),
                        },
                    },
                ],
            })).map((account) => AuctionManager.from(account));
        });
    }
}

class Transaction extends Transaction$1 {
    constructor(options) {
        super(options);
    }
    static fromCombined(transactions) {
        const combinedTransaction = new Transaction({});
        transactions.forEach((transaction) => transaction.instructions.forEach((instruction) => {
            combinedTransaction.add(instruction);
        }));
        return combinedTransaction;
    }
}

var VaultKey;
(function (VaultKey) {
    VaultKey[VaultKey["Uninitialized"] = 0] = "Uninitialized";
    VaultKey[VaultKey["VaultV1"] = 3] = "VaultV1";
    VaultKey[VaultKey["SafetyDepositBoxV1"] = 1] = "SafetyDepositBoxV1";
    VaultKey[VaultKey["ExternalPriceAccountV1"] = 2] = "ExternalPriceAccountV1";
})(VaultKey || (VaultKey = {}));
class VaultProgram extends Program$5 {
    constructor() {
        super(VaultProgram.PUBKEY);
    }
}
VaultProgram.PREFIX = 'vault';
VaultProgram.PUBKEY = new PublicKey(config.programs.vault);
var Program$1 = new VaultProgram();

const safetyDepositStruct = struct([
    ['key', 'u8'],
    ['vault', 'pubkeyAsString'],
    ['tokenMint', 'pubkeyAsString'],
    ['store', 'pubkeyAsString'],
    ['order', 'u8'],
], [], (data) => {
    data.key = VaultKey.SafetyDepositBoxV1;
    return data;
});
class SafetyDepositBox extends Account {
    constructor(key, info) {
        super(key, info);
        if (!this.assertOwner(Program$1.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!SafetyDepositBox.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = safetyDepositStruct.deserialize(this.info.data);
    }
    static getPDA(vault, mint) {
        return __awaiter(this, void 0, void 0, function* () {
            return Program$1.findProgramAddress([
                Buffer.from(VaultProgram.PREFIX),
                new PublicKey(vault).toBuffer(),
                new PublicKey(mint).toBuffer(),
            ]);
        });
    }
    static isCompatible(data) {
        return data[0] === VaultKey.SafetyDepositBoxV1;
    }
}

var VaultState;
(function (VaultState) {
    VaultState[VaultState["Inactive"] = 0] = "Inactive";
    VaultState[VaultState["Active"] = 1] = "Active";
    VaultState[VaultState["Combined"] = 2] = "Combined";
    VaultState[VaultState["Deactivated"] = 3] = "Deactivated";
})(VaultState || (VaultState = {}));
const vaultStruct = struct([
    ['key', 'u8'],
    ['tokenProgram', 'pubkeyAsString'],
    ['fractionMint', 'pubkeyAsString'],
    ['authority', 'pubkeyAsString'],
    ['fractionTreasury', 'pubkeyAsString'],
    ['redeemTreasury', 'pubkeyAsString'],
    ['allowFurtherShareCreation', 'u8'],
    ['pricingLookupAddress', 'pubkeyAsString'],
    ['tokenTypeCount', 'u8'],
    ['state', 'u8'],
    ['lockedPricePerShare', 'u64'],
], [], (data) => {
    data.key = VaultKey.VaultV1;
    return data;
});
class Vault extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program$1.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!Vault.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = vaultStruct.deserialize(this.info.data);
    }
    static getPDA(pubkey) {
        return __awaiter(this, void 0, void 0, function* () {
            return Program$1.findProgramAddress([
                Buffer.from(VaultProgram.PREFIX),
                VaultProgram.PUBKEY.toBuffer(),
                new PublicKey(pubkey).toBuffer(),
            ]);
        });
    }
    static isCompatible(data) {
        return data[0] === VaultKey.VaultV1;
    }
    getSafetyDepositBoxes(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Program$1.getProgramAccounts(connection, {
                filters: [
                    {
                        memcmp: {
                            offset: 0,
                            bytes: bs58.encode(Buffer.from([VaultKey.SafetyDepositBoxV1])),
                        },
                    },
                    {
                        memcmp: {
                            offset: 1,
                            bytes: this.pubkey.toBase58(),
                        },
                    },
                ],
            })).map((account) => SafetyDepositBox.from(account));
        });
    }
}

const setStoreStruct = struct([
    ['instruction', 'u8'],
    ['public', 'u8'],
]);
class SetStore extends Transaction {
    constructor(options, params) {
        super(options);
        const { feePayer } = options;
        const { admin, store, isPublic } = params;
        const data = setStoreStruct.serialize({ instruction: 8, public: isPublic });
        this.add(new TransactionInstruction({
            keys: [
                {
                    pubkey: store,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: admin,
                    isSigner: true,
                    isWritable: false,
                },
                {
                    pubkey: feePayer,
                    isSigner: true,
                    isWritable: false,
                },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                {
                    pubkey: VaultProgram.PUBKEY,
                    isSigner: false,
                    isWritable: false,
                },
                {
                    pubkey: MetadataProgram.PUBKEY,
                    isSigner: false,
                    isWritable: false,
                },
                {
                    pubkey: AuctionProgram.PUBKEY,
                    isSigner: false,
                    isWritable: false,
                },
                {
                    pubkey: SystemProgram.programId,
                    isSigner: false,
                    isWritable: false,
                },
                {
                    pubkey: SYSVAR_RENT_PUBKEY,
                    isSigner: false,
                    isWritable: false,
                },
            ],
            programId: MetaplexProgram.PUBKEY,
            data,
        }));
    }
}

var NFTPacksAccountType;
(function (NFTPacksAccountType) {
    NFTPacksAccountType[NFTPacksAccountType["Uninitialized"] = 0] = "Uninitialized";
    NFTPacksAccountType[NFTPacksAccountType["PackSet"] = 1] = "PackSet";
    NFTPacksAccountType[NFTPacksAccountType["PackCard"] = 2] = "PackCard";
    NFTPacksAccountType[NFTPacksAccountType["PackVoucher"] = 3] = "PackVoucher";
    NFTPacksAccountType[NFTPacksAccountType["ProvingProcess"] = 4] = "ProvingProcess";
})(NFTPacksAccountType || (NFTPacksAccountType = {}));
class NFTPacksProgram extends Program$5 {
    constructor() {
        super(NFTPacksProgram.PUBKEY);
    }
}
NFTPacksProgram.PREFIX = 'packs';
NFTPacksProgram.PUBKEY = new PublicKey('BNRmGgciUJuyznkYHnmitA9an1BcDDiU9JmjEQwvBYVR');
var Program = new NFTPacksProgram();

var DistributionType;
(function (DistributionType) {
    DistributionType[DistributionType["FixedNumber"] = 0] = "FixedNumber";
    DistributionType[DistributionType["ProbabilityBased"] = 1] = "ProbabilityBased";
})(DistributionType || (DistributionType = {}));
const distributionStruct = struct([
    ['type', 'u8'],
    ['value', 'u64'],
]);
const packCardStruct = struct([
    ['accountType', 'u8'],
    ['packSet', 'pubkeyAsString'],
    ['master', 'pubkeyAsString'],
    ['metadata', 'pubkeyAsString'],
    ['tokenAccount', 'pubkeyAsString'],
    ['maxSupply', { kind: 'option', type: 'u32' }],
    ['distribution', distributionStruct.type],
    ['currentSupply', 'u32'],
], [distributionStruct], (data) => {
    data.accountType = NFTPacksAccountType.PackCard;
    return data;
});
class PackCard extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!PackCard.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = packCardStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data[0] === NFTPacksAccountType.PackCard;
    }
    static getPDA(packSet, index) {
        return Program.findProgramAddress([
            Buffer.from(PackCard.PREFIX),
            new PublicKey(packSet).toBuffer(),
            Buffer.from(index.toString()),
        ]);
    }
}
PackCard.PREFIX = 'card';

var PackSetState;
(function (PackSetState) {
    PackSetState[PackSetState["NotActivated"] = 0] = "NotActivated";
    PackSetState[PackSetState["Activated"] = 1] = "Activated";
    PackSetState[PackSetState["Deactivated"] = 2] = "Deactivated";
})(PackSetState || (PackSetState = {}));
const packSetStruct = struct([
    ['accountType', 'u8'],
    ['name', [32]],
    ['authority', 'pubkeyAsString'],
    ['mintingAuthority', 'pubkeyAsString'],
    ['totalPacks', 'u32'],
    ['packCards', 'u32'],
    ['packVouchers', 'u32'],
    ['mutable', 'u8'],
    ['state', 'u8'],
], [], (data) => {
    data.accountType = NFTPacksAccountType.PackSet;
    data.name = String.fromCharCode.apply(null, data.name).replace(/\0.*$/g, '');
    data.state = data.state;
    return data;
});
class PackSet extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!PackSet.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = packSetStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data[0] === NFTPacksAccountType.PackSet;
    }
    getCards(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Program.getProgramAccounts(connection, {
                filters: [
                    {
                        memcmp: {
                            offset: 0,
                            bytes: bs58.encode(Buffer.from([NFTPacksAccountType.PackCard])),
                        },
                    },
                    {
                        memcmp: {
                            offset: 1,
                            bytes: this.pubkey.toBase58(),
                        },
                    },
                ],
            })).map((account) => PackCard.from(account));
        });
    }
}

var ActionOnProve;
(function (ActionOnProve) {
    ActionOnProve[ActionOnProve["Burn"] = 0] = "Burn";
    ActionOnProve[ActionOnProve["Redeem"] = 1] = "Redeem";
})(ActionOnProve || (ActionOnProve = {}));
const packVoucherStruct = struct([
    ['accountType', 'u8'],
    ['packSet', 'pubkeyAsString'],
    ['master', 'pubkeyAsString'],
    ['metadata', 'pubkeyAsString'],
    ['tokenAccount', 'pubkeyAsString'],
    ['maxSupply', { kind: 'option', type: 'u32' }],
    ['currentSupply', 'u32'],
    ['numberToOpen', 'u32'],
    ['actionOnProve', 'u8'],
], [], (data) => {
    data.accountType = NFTPacksAccountType.PackVoucher;
    return data;
});
class PackVoucher extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!PackVoucher.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = packVoucherStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data[0] === NFTPacksAccountType.PackVoucher;
    }
    static getPDA(packSet, index) {
        return Program.findProgramAddress([
            Buffer.from(PackVoucher.PREFIX),
            new PublicKey(packSet).toBuffer(),
            Buffer.from(index.toString()),
        ]);
    }
}
PackVoucher.PREFIX = 'voucher';

const provingProcessStruct = struct([
    ['accountType', 'u8'],
    ['userWallet', 'pubkeyAsString'],
    ['packSet', 'pubkeyAsString'],
    ['provedVouchers', 'u32'],
    ['provedVoucherEditions', 'u32'],
    ['claimedCards', 'u32'],
    ['claimedCardEditions', 'u32'],
], [], (data) => {
    data.accountType = NFTPacksAccountType.ProvingProcess;
    return data;
});
class ProvingProcess extends Account {
    constructor(pubkey, info) {
        super(pubkey, info);
        if (!this.assertOwner(Program.pubkey)) {
            throw ERROR_INVALID_OWNER();
        }
        if (!ProvingProcess.isCompatible(this.info.data)) {
            throw ERROR_INVALID_ACCOUNT_DATA();
        }
        this.data = provingProcessStruct.deserialize(this.info.data);
    }
    static isCompatible(data) {
        return data[0] === NFTPacksAccountType.ProvingProcess;
    }
    static getPDA(packSet, userWallet) {
        return Program.findProgramAddress([
            Buffer.from(ProvingProcess.PREFIX),
            new PublicKey(packSet).toBuffer(),
            new PublicKey(userWallet).toBuffer(),
        ]);
    }
}
ProvingProcess.PREFIX = 'proving';

class PayForFiles extends Transaction {
    constructor(options, params) {
        const { feePayer } = options;
        const { lamports, fileHashes, arweaveWallet } = params;
        super(options);
        this.add(SystemProgram.transfer({
            fromPubkey: feePayer,
            toPubkey: arweaveWallet !== null && arweaveWallet !== void 0 ? arweaveWallet : new PublicKey(config.arweaveWallet),
            lamports,
        }));
        fileHashes.forEach((data) => {
            this.add(new TransactionInstruction({
                keys: [],
                programId: new PublicKey(config.programs.memo),
                data,
            }));
        });
    }
}

class CreateMint extends Transaction {
    constructor(options, params) {
        const { feePayer } = options;
        const { newAccountPubkey, lamports, decimals, owner, freezeAuthority } = params;
        super(options);
        this.add(SystemProgram.createAccount({
            fromPubkey: feePayer,
            newAccountPubkey: newAccountPubkey,
            lamports,
            space: MintLayout.span,
            programId: TOKEN_PROGRAM_ID,
        }));
        this.add(Token.createInitMintInstruction(TOKEN_PROGRAM_ID, newAccountPubkey, decimals !== null && decimals !== void 0 ? decimals : 0, owner !== null && owner !== void 0 ? owner : feePayer, freezeAuthority !== null && freezeAuthority !== void 0 ? freezeAuthority : feePayer));
    }
}

class CreateAssociatedTokenAccount extends Transaction {
    constructor(options, params) {
        const { feePayer } = options;
        const { associatedTokenAddress, walletAddress, splTokenMintAddress } = params;
        super(options);
        this.add(new TransactionInstruction({
            keys: [
                {
                    pubkey: feePayer,
                    isSigner: true,
                    isWritable: true,
                },
                {
                    pubkey: associatedTokenAddress,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: walletAddress !== null && walletAddress !== void 0 ? walletAddress : feePayer,
                    isSigner: false,
                    isWritable: false,
                },
                {
                    pubkey: splTokenMintAddress,
                    isSigner: false,
                    isWritable: false,
                },
                {
                    pubkey: SystemProgram.programId,
                    isSigner: false,
                    isWritable: false,
                },
                {
                    pubkey: TOKEN_PROGRAM_ID,
                    isSigner: false,
                    isWritable: false,
                },
                {
                    pubkey: SYSVAR_RENT_PUBKEY,
                    isSigner: false,
                    isWritable: false,
                },
            ],
            programId: ASSOCIATED_TOKEN_PROGRAM_ID,
            data: Buffer.from([]),
        }));
    }
}

export { ActionOnProve, ArweaveStorage, Auction, AuctionExtended, AuctionManager, AuctionManagerStatus, AuctionProgram, AuctionState, BidRedemptionTicket, BidStateType, BidderMetadata, BidderPot, ChainId, Coingecko, Connection, ConversionRateProvider, CreateAssociatedTokenAccount, CreateMint, Currency, DistributionType, ENV, Edition, EditionMarker, errors as Errors, MasterEdition, Metadata, MetadataKey, MetadataProgram, MetaplexKey, MetaplexProgram, NFTPacksAccountType, NFTPacksProgram, NonWinningConstraint, PackCard, PackSet, PackSetState, PackVoucher, PayForFiles, PayoutTicket, PriceFloorType, PrizeTrackingTicket, ProvingProcess, SafetyDepositBox, SafetyDepositConfig, SetStore, Store, Transaction, index as Utils, Vault, VaultKey, VaultProgram, VaultState, WINNER_INDEX_OFFSETS, WhitelistedCreator, WinningConfigType, WinningConstraint };
//# sourceMappingURL=index.browser.esm.js.map
