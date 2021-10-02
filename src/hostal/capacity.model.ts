/* eslint-disable prettier/prettier */
import { Rule } from "./rule.model";
export class Capacity {
    type: string;
    capacity: {
        adults: number,
        childs: number,
    };
    rooms: number;
    affi_benefits: {
        rules: Rule[]
    }
}