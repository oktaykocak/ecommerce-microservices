import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { EventEmitterService } from '../events/event-emitter.service';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { OrderEventsConsumer } from './order.events.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [OrderController, OrderEventsConsumer],
  providers: [OrderService, EventEmitterService],
})
export class OrderModule {}
