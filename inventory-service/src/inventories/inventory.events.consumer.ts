import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryEventsConsumer {
  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern('order.created')
  async handleOrderCreated(@Payload() data: any) {
    const { orderId, customerId, items } = data;
    const success = await this.inventoryService.processOrderCreatedInventory(
      orderId,
      customerId,
      items,
    );
    return success;
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(@Payload() data: any) {
    const { orderId, items } = data;
    const success = await this.inventoryService.processOrderCancelledInventory(
      orderId,
      items,
    );
    return success;
  }
}
