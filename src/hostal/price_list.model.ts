/* eslint-disable prettier/prettier */
export class PriceList {
    affi_type: string;
    prices: {
        title: string;
        price_per_type: {
            type: string,
            price: number
        }[]
    }[];

}