// src/events/event-emitter.service.ts
import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { getRmqOptions } from 'src/configs/rabbitmq.config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class EventEmitterService {
  private orderClient: ClientProxy;
  private notificationClient: ClientProxy;

  constructor() {
    this.orderClient = ClientProxyFactory.create(
      getRmqOptions(
        process.env.RABBITMQ_ORDER_SERVICE ?? 'order_service_queue',
      ),
    );
    this.notificationClient = ClientProxyFactory.create(
      getRmqOptions(
        process.env.RABBITMQ_NOTIFICATION_SERVICE ?? 'notification_service_queue',
      ),
    );
  }

  async publishOrderCompleted(orderId: string) {
    await lastValueFrom(this.orderClient.emit('order.completed', { orderId }));
  }

  async publishOrderRejected(orderId: string, reason: string) {
    await lastValueFrom(
      this.orderClient.emit('order.rejected', { orderId, reason }),
    );
  }

  async publishNotification(customerId: string, message: string) {
    await lastValueFrom(
      this.notificationClient.emit('notification.created', { customerId, message }),
    );
  }
}
