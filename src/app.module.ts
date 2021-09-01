import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HostalModule } from './hostal/hostal.module';
import { CategoriaService } from './src/hostal/categoria/categoria.service';
import { CategoriaController } from './categoria/categoria.controller';

@Module({
  imports: [
    HostalModule,
    MongooseModule.forRoot('mongodb://admin:admin@localhost:27017/hostal', {
      autoCreate: true
    })
  ],
  controllers: [AppController, CategoriaController],
  providers: [AppService, CategoriaService],
})
export class AppModule {}
