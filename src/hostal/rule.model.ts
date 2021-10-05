/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


export type RuleDocument = Rule & Document;
@Schema()

export class Rule {
    @Prop()
    name: string;

    @Prop()
    affi_type: number;

    @Prop()
    amount: number;
}

export const RuleSchema = SchemaFactory.createForClass(Rule);