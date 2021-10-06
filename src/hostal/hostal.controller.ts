import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Hostal } from './hostal.model';
import { HostalService } from './hostal.service';

@Controller('hostal')
export class HostalController {
    constructor(private readonly service: HostalService) {}

    @Get()
    async findAll() {
        return await this.service.findAll();
    }
    @Post()
    async create(@Body() model: Hostal) {
        return await this.service.create(model);
    }
    @Put(':id')
    async update(@Param('id') id: string, @Body() model: Hostal) {
        return await this.service.update(id, model);
    }
    @Delete(':id')
    async delete (@Param('id') id: string) {
        return await this.service.delete(id);
    }
}
