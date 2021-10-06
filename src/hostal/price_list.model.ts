export class PriceList {
    affi_type: string; 
    prices: {
        title: string;
        days: string[];
        price_per_type: {
            type: string, 
            price: number 
        }[]
    }[];
}