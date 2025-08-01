import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderEventsConsumer {
  constructor(private readonly orderService: OrderService) {}

  @EventPattern('order.completed')
  async handleOrderCompleted(@Payload() data: any) {
    const { orderId } = data;
    const success = await this.orderService.processOrderCompleted(orderId);
    return success;
  }

  @EventPattern('order.rejected')
  async handleOrderRejected(@Payload() data: any) {
    const { orderId } = data;
    const success = await this.orderService.processOrderRejected(orderId);
    return success;
  }
}
