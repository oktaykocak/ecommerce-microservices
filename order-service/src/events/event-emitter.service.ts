// src/events/event-emitter.service.ts
import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { getRmqOptions } from 'src/configs/rabbitmq.config';
import { lastValueFrom } from 'rxjs';
import { OrderResponseDto } from 'src/orders/dto/order-response.dto';

@Injectable()
export class EventEmitterService {
  private inventoryClient: ClientProxy;

  constructor() {
    this.inventoryClient = ClientProxyFactory.create(
      getRmqOptions(
        process.env.RABBITMQ_NOTIFICATION_SERVICE ?? 'inventory_service_queue',
      ),
    );
  }

  async emitOrderCreated(dto: OrderResponseDto) {
    const order = {
      orderId: dto.id,
      customerId: dto.customerId,
      items: dto.items,
    };
    await lastValueFrom(this.inventoryClient.emit('order.created', order));
  }

  async emitOrderCancelled(dto: OrderResponseDto) {
    const order = {
      orderId: dto.id,
      items: dto.items,
    };
    await lastValueFrom(this.inventoryClient.emit('order.cancelled', order));
  }
}
