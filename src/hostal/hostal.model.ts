/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Capacity } from "./capacity.model";
import { PriceList } from "./price_list.model";

export type HostalDocument = Hostal & Document;
@Schema()

export class Hostal {
    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop()
    pictures: string[];

    @Prop()
    price_list: PriceList[];

    @Prop()
    capacity_and_benefits: Capacity[];
}

export const HostalSchema = SchemaFactory.createForClass(Hostal);