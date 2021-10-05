/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */

export class HostalArray {
    date_arrival: Date;
    date_departure: Date;
    adults: Number;
    childs: Number;
    Capacity_Array: {
        type: string;
        rooms: Number;
        total_price: Number;
    }[]
}
