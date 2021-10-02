/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HostalController } from './hostal.controller';
import { Hostal, HostalSchema } from './hostal.model';
import { HostalService } from './hostal.service';
import { Room, RoomSchema } from './room.model';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {name: Hostal.name, schema: HostalSchema},
        {name: Room.name, schema: RoomSchema}
      ]
    )
  ],
  controllers: [HostalController],
  providers: [HostalService]
})
export class HostalModule {}
