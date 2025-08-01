import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { getRmqOptions } from './configs/rabbitmq.config';
import { ValidationPipe } from '@nestjs/common';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  let retries = 5;
  while (retries > 0) {
    try {
      app.connectMicroservice<MicroserviceOptions>(getRmqOptions(process.env.RABBITMQ_DEFAULT_SERVICE ?? 'order_service_queue'));

      await app.startAllMicroservices();
      app.useGlobalPipes(new ValidationPipe());
      await app.listen(process.env.APP_PORT ?? 8080);

      console.log('Order Service is running on port 8080');
      break;
    } catch (err) {
      retries--;
      console.log(`Connection failed, retries left: ${retries}`);
      if (retries === 0) throw err;
      await new Promise((res) => setTimeout(res, 5000)); // wait 5 seconds
    }
  }
}
bootstrap();
