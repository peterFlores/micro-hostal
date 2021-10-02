/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RoomDocument = Room & Document;
@Schema()

export class Room {
    @Prop()
    hostal: string;

    @Prop()
    type: string;

    @Prop()
    date_arrival: string;

    @Prop()
    date_departure: string;

    @Prop()
    status: number;
}

export const RoomSchema = SchemaFactory.createForClass(Room);