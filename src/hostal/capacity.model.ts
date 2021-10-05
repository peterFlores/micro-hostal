/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */

export class Capacity {
    type: string;
    capacity: {
        adults: number,
        childs: number,
    };
    rooms: number;
    affi_benefits: {
        rules: String[];
    }
}