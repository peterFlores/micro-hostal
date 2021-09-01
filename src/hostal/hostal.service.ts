import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hostal, HostalDocument } from './hostal.model';

@Injectable()
export class HostalService  {

    constructor
        (@InjectModel(Hostal.name) private readonly hostalModel: Model<HostalDocument>) {}

    async findAll(): Promise<Hostal[]> {
        return await this.hostalModel.find().exec();
    }

    async findOne(id: string): Promise<Hostal> {
        return await this.hostalModel.findById(id).exec();
    }

    async create(hostal: Hostal): Promise<Hostal> {
        return await new this.hostalModel(hostal).save();
    }

    async update(id: string, hostal: Hostal): Promise<Hostal> {
        return await this.hostalModel.findByIdAndUpdate(id, hostal).exec();
    }

    async delete(id: string): Promise<Hostal> {
        return await this.hostalModel.findByIdAndDelete(id).exec();
    }
}
