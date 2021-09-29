/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HostalController } from './hostal.controller';
import { Hostal, HostalSchema } from './hostal.model';
import { HostalService } from './hostal.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {name: Hostal.name, schema: HostalSchema}
      ]
    )
  ],
  controllers: [HostalController],
  providers: [HostalService]
})
export class HostalModule {}
