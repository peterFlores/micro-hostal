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
import { Console } from 'console';
import * as moment from 'moment';

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
        const hostal = await this.hostalModel.findById(requesthostal.id_hostal).exec();
        const types_hostal = hostal.capacity_and_benefits
        const Days = ['Sunday','Monday','Tuesday','Wesnesday','Thursday','Friday','Saturday'];
        const FDay = new Date(requesthostal.date_arrival).getDay();
        const LDay = new Date(requesthostal.date_departure).getDay();

        const FirstDay = Days[FDay];
        const LastDay = Days[LDay];

        let Date1 = moment(requesthostal.date_arrival);
        let Date2 = moment(requesthostal.date_departure);

        const Date_Diff = Date2.diff(Date1, 'days') - 1
        let S_Day
        
        const ArrayDays = []

        ArrayDays.push(FirstDay)
        if (FDay == 6) { S_Day = 0 } else { S_Day = FDay + 1 }
        for (let i = 0 ; i < Date_Diff; i++) {
            ArrayDays.push(Days[S_Day])
            if (S_Day == 6) { S_Day = -1 } 
            S_Day++
        }
        ArrayDays.push(LastDay)

        ArrayDays.forEach(Day => {
            console.log(Day)
        });

        
        let No_RoomsA
        let No_RoomsC
        let No_Rooms

        types_hostal.forEach(type => {
            let adults = requesthostal.adults
            let childs = requesthostal.childs
            No_RoomsA = 0
            No_RoomsC = 0
            do {
                if(type.capacity.adults > adults){No_RoomsA = 1
                    break}
                adults = adults - type.capacity.adults
                if(adults === 0){No_RoomsA++
                    break}
                No_RoomsA++
                if(adults < type.capacity.adults){No_RoomsA++
                    break}
            } while ( adults != 0);
            do {
                if(type.capacity.childs > childs){No_RoomsC = 1
                    break}
                childs = childs - type.capacity.childs
                if(childs === 0){ No_RoomsC++
                    break}
                No_RoomsC++
                if(childs < type.capacity.childs){No_RoomsC++
                    break}
            } while ( childs != 0);
            if (No_RoomsA == No_RoomsC){No_Rooms = No_RoomsA}
            if (No_RoomsA > No_RoomsC){No_Rooms = No_RoomsA}
            if (No_RoomsA < No_RoomsC){No_Rooms = No_RoomsC}
            console.log(type.type)
            console.log('NUMERO DE CUARTOS')
            console.log(No_Rooms)
        });

        return
    }

}
