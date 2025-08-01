// src/events/event-emitter.service.ts
import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { getRmqOptions } from 'src/configs/rabbitmq.config';
//import { lastValueFrom } from 'rxjs';

@Injectable()
export class EventEmitterService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create(getRmqOptions(process.env.RABBITMQ_DEFAULT_SERVICE ?? 'order_notification_queue'));
  }

  /**
   * This service is not necessery for now
   * IF we need some event for others service, emitter code will be happen here 
   */

  /*
  async publishSomeEvent(orderId: string) {
    await lastValueFrom(this.client.emit('some.event', { orderId }));
  }
  */
}
