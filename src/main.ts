/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  app.setGlobalPrefix("api/v1")
  app.enableCors({
    origin: 'http://localhost:4200'
  });
  await app.listen(3004);
}
bootstrap();
