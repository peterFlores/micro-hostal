/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-array-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import { Hostal, HostalDocument } from './hostal.model';
import { RequestHostal } from "./requesthostal.model";
import { HostalArray } from "./hostalarray.model";
import { Room, RoomDocument } from "./room.model";
import { Rule, RuleDocument} from "./rule.model";
import { async } from 'rxjs';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import { HostalReservation } from './hostal_reservation.model';

@Injectable()
export class HostalService  {

    constructor
        (@InjectModel(Hostal.name) private readonly hostalModel: Model<HostalDocument>,
         @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
         @InjectModel(Rule.name) private readonly ruleModel: Model<RuleDocument>
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
            type._id = new mongoose.Types.ObjectId()
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
        let Hostal_Array = new HostalArray
        Hostal_Array.date_arrival = requesthostal.date_arrival
        Hostal_Array.date_departure = requesthostal.date_departure
        Hostal_Array.adults = requesthostal.adults
        Hostal_Array.childs = requesthostal.childs

        //Const's Hostal
        const hostal = await this.hostalModel.findById(requesthostal.id_hostal).exec();
        const types_hostal = hostal.capacity_and_benefits
        const prices_hostal = hostal.price_list

        //Const's Dates
        const Days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const FDay = new Date(requesthostal.date_arrival).getDay();
        const LDay = new Date(requesthostal.date_departure).getDay();
        const FirstDay = Days[FDay];
        const LastDay = Days[LDay];

        let Date1 = moment(new Date(requesthostal.date_arrival));
        let Date2 = moment(new Date(requesthostal.date_departure));

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

        let No_RoomsA
        let No_RoomsC
        let No_Rooms
        let No_Rooms_Affi
        let Total_Price, Total_Room, Total_Room_Affi
        Hostal_Array.Capacity_Array = new Array()

        await Promise.all(types_hostal.map(async type => {
            const hostal_rules = type.affi_benefits
            
            if (Array.isArray(hostal_rules)) {
                
                await Promise.all(Object.keys(hostal_rules).map( async rules_h => {

                    await Promise.all(Object.keys(rules_h).map(async (rule) =>{
                        const rules = await this.ruleModel.findOne({name: rule, affi_type: requesthostal.affi_type}).exec();
                        Total_Room_Affi = 0
                        Total_Room = 0
                        Total_Price = 0

                        if (rules == null) {
                            let adults = requesthostal.adults
                            let childs = requesthostal.childs
                            No_RoomsA = 0
                            No_RoomsC = 0
                            No_Rooms_Affi = 0

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

                            const rooms_type = await this.roomModel.find({hostal: hostal.name, type: type.type, date_arrival: "empty", date_departure: "empty"}).exec()
                            if (No_Rooms > rooms_type.length) {
                                Hostal_Array.Capacity_Array.push({_id: type._id, type: type.type, rooms: No_Rooms, total_price: 0, availability: " No se hay cuartos disponibles"})
                            }else{
                                console.log("TIPO DE HABITACION " + type.type)
                                console.log('NUMERO DE CUARTOS EN TOTAL ' + No_Rooms)
                                No_Rooms_Affi = 0
                                console.log('NUMERO DE CUARTOS SIN AFFI TYPE ' + No_Rooms)
                                console.log('NUMERO DE CUARTOS Con AFFI TYPE ' + No_Rooms_Affi)

                                if(requesthostal.affi_type == 0){
                                    prices_hostal.forEach(type_price => {
                                        if(type_price.affi_type == '0'){
                                            const pricesdays = type_price.prices
                                            ArrayDays.forEach(Day => {
                                                pricesdays.forEach(priceday => {
                                                    if (Day == 'Thursday') {
                                                        if (priceday.title == 'Thursday/Friday') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room = Total_Room + price.price
                                                                }
                                                            });
                                                        }                                                    
                                                    }else if (Day == 'Friday') {
                                                        if (priceday.title == 'Friday-Saturday') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room = Total_Room + price.price
                                                                }
                                                            });
                                                        }                                                    
                                                    }else if (Day == 'Saturday') {
                                                        if (priceday.title == 'Saturday/DF/TA') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room = Total_Room + price.price
                                                                }
                                                            });
                                                        }                                                    
                                                    }else{
                                                        if (priceday.title == 'Sunday-Wednesday') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room = Total_Room + price.price
                                                                }
                                                            });
                                                        }
                                                    }                                               
                                                });
                                            });

                                            Total_Price = No_Rooms * Total_Room
                                            console.log('TOTAL A PAGAR POR CUARTO ' + Total_Room)
                                            console.log('TOTAL GENERAL ' + Total_Price)
                                            Hostal_Array.Capacity_Array.push({_id: type._id, type: type.type, rooms: No_Rooms, total_price: Total_Price, availability: "Disponible"})

                                        }
                                    });
                                }
                            }
                            
                            
                        }else{
                            let adults = requesthostal.adults
                            let childs = requesthostal.childs
                            No_RoomsA = 0
                            No_RoomsC = 0
                            No_Rooms_Affi = 0

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

                            const rooms_type = await this.roomModel.find({hostal: hostal.name, type: type.type, date_arrival: "empty", date_departure: "empty"}).exec()

                            if (No_Rooms > rooms_type.length) {
                                Hostal_Array.Capacity_Array.push({_id: type._id, type: type.type, rooms: No_Rooms, total_price: 0, availability: " No se hay cuartos disponibles"})
                            }else{
                                console.log("TIPO DE HABITACION " + type.type)
                                console.log('NUMERO DE CUARTOS EN TOTAL ' + No_Rooms)
                                No_Rooms_Affi = rules.amount
                                let New_No_Rooms = No_Rooms - No_Rooms_Affi
                                console.log('NUMERO DE CUARTOS SIN AFFI TYPE ' + New_No_Rooms)
                                console.log('NUMERO DE CUARTOS Con AFFI TYPE ' + No_Rooms_Affi)

                                if(requesthostal.affi_type == 1){
                                    prices_hostal.forEach(type_price => {
                                        if(type_price.affi_type == '1'){
                                            const pricesdays = type_price.prices
                                            ArrayDays.forEach(Day => {
                                                pricesdays.forEach(priceday => {
                                                    if (Day == 'Thursday') {
                                                        if (priceday.title == 'Thursday/Friday') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room_Affi = Total_Room_Affi + price.price
                                                                }
                                                            });
                                                        }                                                    
                                                    }else if (Day == 'Friday') {
                                                        if (priceday.title == 'Friday-Saturday') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room_Affi = Total_Room_Affi + price.price
                                                                }
                                                            });
                                                        }                                                    
                                                    }else if (Day == 'Saturday') {
                                                        if (priceday.title == 'Saturday/DF/TA') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room_Affi = Total_Room_Affi + price.price
                                                                }
                                                            });
                                                        }                                                    
                                                    }else{
                                                        if (priceday.title == 'Sunday-Wednesday') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room_Affi = Total_Room_Affi + price.price
                                                                }
                                                            });
                                                        }
                                                    }                                                
                                                });
                                            });
                                        }
                                        if(type_price.affi_type == '0'){
                                            const pricesdays = type_price.prices
                                            ArrayDays.forEach(Day => {
                                                pricesdays.forEach(priceday => {
                                                    if (Day == 'Thursday') {
                                                        if (priceday.title == 'Thursday/Friday') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room = Total_Room + price.price
                                                                }
                                                            });
                                                        }                                                    
                                                    }else if (Day == 'Friday') {
                                                        if (priceday.title == 'Friday-Saturday') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room = Total_Room + price.price
                                                                }
                                                            });
                                                        }                                                    
                                                    }else if (Day == 'Saturday') {
                                                        if (priceday.title == 'Saturday/DF/TA') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room = Total_Room + price.price
                                                                }
                                                            });
                                                        }                                                    
                                                    }else{
                                                        if (priceday.title == 'Sunday-Wednesday') {
                                                            priceday.price_per_type.forEach(price => {
                                                                if (price.type == type.type) {
                                                                    Total_Room = Total_Room + price.price
                                                                }
                                                            });
                                                        }
                                                    }                                               
                                                });
                                            });
                                        }
                                    });
                                }

                                Total_Price = (New_No_Rooms * Total_Room)+(No_Rooms_Affi * Total_Room_Affi)
                                console.log('TOTAL A PAGAR POR CUARTO NO AFFI ' + Total_Room)
                                console.log('TOTAL A PAGAR POR CUARTO AFFI ' + Total_Room_Affi)
                                console.log('TOTAL GENERAL ' + Total_Price)
                                Hostal_Array.Capacity_Array.push({_id: type._id, type: type.type, rooms: No_Rooms, total_price: Total_Price, availability: "Disponible"})
                            }
                        }
                    }))
                }));
            }          
        }));

        return Hostal_Array
    }

}


