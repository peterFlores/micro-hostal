/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hostal, HostalDocument } from './hostal.model';
import { RequestHostal } from "./requesthostal.model";
import { HostalArray } from "./hostalarray.model";
import { Room, RoomDocument } from "./room.model";
import { async } from 'rxjs';

@Injectable()
export class HostalService  {

    constructor
        (@InjectModel(Hostal.name) private readonly hostalModel: Model<HostalDocument>,
         @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
        ) {}

    async findAll(): Promise<Hostal[]> {
        return await this.hostalModel.find().exec();
    }

    async findOne(id: string): Promise<Hostal> {
        return await this.hostalModel.findById(id).exec();
    }

    async create(hostal: Hostal): Promise<Hostal> {
        const types_hostal = hostal.capacity_and_benefits
        types_hostal.forEach( async type => { 
            for (let i = 1; i <= type.rooms; i++) {
                let room = new Room
                room.hostal = hostal.name
                room.type = type.type
                room.date_arrival = "empty"
                room.date_departure = "empty"
                room.status = 0
                await new this.roomModel(room).save();
             }
        });
        return await new this.hostalModel(hostal).save();
    }

    async update(id: string, hostal: Hostal): Promise<Hostal> {
        const name_hostal = hostal.name
        const types_hostal = hostal.capacity_and_benefits
        const old_hostal = await this.hostalModel.findById(id).exec();
        const rooms_hostal = await this.roomModel.find({hostal: old_hostal.name}).exec();
    
        types_hostal.forEach(async type => {
            let no_rooms = 0
            rooms_hostal.forEach(room => {
                if(room.type == type.type){
                    room.hostal = name_hostal
                    this.roomModel.findByIdAndUpdate(room._id, room).exec();
                    no_rooms = no_rooms + 1
                }
            });
            if(no_rooms != type.rooms){
                if(type.rooms > no_rooms){
                    let new_rooms = type.rooms - no_rooms
                    for (let i = 1; i <= new_rooms; i++) {
                        let room = new Room
                        room.hostal = hostal.name
                        room.type = type.type
                        room.date_arrival = "empty"
                        room.date_departure = "empty"
                        room.status = 0
                        await new this.roomModel(room).save();
                    }
                }
                if(type.rooms < no_rooms){
                    let delete_rooms = no_rooms - type.rooms 
                    for(let room of rooms_hostal){
                        if(room.type == type.type){
                            if(delete_rooms == 0){break;}
                            if (room.date_arrival == 'empty' && room.date_departure == 'empty') {
                                delete_rooms = delete_rooms - 1;
                                this.roomModel.findByIdAndDelete(room._id).exec();
                }}}}  
            }
        });
        return await this.hostalModel.findByIdAndUpdate(id, hostal).exec();
    }

    async delete(id: string): Promise<Hostal> {
        const hostal = await this.hostalModel.findById(id).exec();
        const rooms_hostal = await this.roomModel.find({hostal: hostal.name}).exec();
        rooms_hostal.forEach(room => {this.roomModel.findByIdAndDelete(room._id).exec();});
        return await this.hostalModel.findByIdAndDelete(id).exec();
    }

    async returnhostaldata(requesthostal: RequestHostal): Promise<HostalArray>{

        const Days = ['Sunday','Monday','Tuesday','Wesnesday','Thursday','Friday','Saturday'];
        const FirstDay = new Date(requesthostal.date_arrival).getDay();
        const LastDay = new Date(requesthostal.date_departure).getDay();
        const nombredia = Days[FirstDay];


        
        return
    }

}
