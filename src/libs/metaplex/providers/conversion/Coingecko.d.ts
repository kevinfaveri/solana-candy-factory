import { ConversionRateProvider, Currency } from './ConversionRateProvider';
export declare class Coingecko implements ConversionRateProvider {
    constructor();
    private static translateCurrency;
    getRate(from: Currency | Currency[], to: Currency | Currency[]): Promise<any[]>;
}
