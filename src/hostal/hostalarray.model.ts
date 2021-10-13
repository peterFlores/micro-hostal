/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */
import * as mongoose from 'mongoose';

export class HostalArray {
    date_arrival: Date;
    date_departure: Date;
    adults: Number;
    childs: Number;
    Capacity_Array: {
        _id: mongoose.Types.ObjectId;
        type: string;
        rooms: Number;
        total_price: Number;
        availability: string;
    }[]
}
