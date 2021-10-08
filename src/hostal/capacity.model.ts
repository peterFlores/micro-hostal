/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */

import * as mongoose from 'mongoose';

export class Capacity {
    _id: mongoose.Types.ObjectId;
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