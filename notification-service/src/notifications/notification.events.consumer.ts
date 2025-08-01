import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationEventsConsumer {
  constructor(private readonly notificationService: NotificationService) {}
  
  @EventPattern('notification.created')
  async handleOrderCreated(@Payload() data: any) {
    const { customerId, message } = data;
    const success = await this.notificationService.processCreateNotification(
      customerId,
      message,
    );
    return success;
  }

}
