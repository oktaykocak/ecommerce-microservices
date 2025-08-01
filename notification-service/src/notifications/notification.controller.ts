import {
  Controller,
  Post,
  Body,
  Param,
  NotFoundException,
  Get,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateNotificationPreferenceDto } from './dto/create-notification-preference.dto';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  createCustomerPreference(
    @Body() createNotificationPreferenceDto: CreateNotificationPreferenceDto,
  ) {
    return this.notificationService.createCustomerPreference(
      createNotificationPreferenceDto,
    );
  }

  @Get(':id')
  async getCustomerPreferenceById(@Param('id', new ParseUUIDPipe()) id: string) {
    const customerPreference = await this.notificationService.getCustomerPreferenceById(id);
    if (!customerPreference) {
      throw new NotFoundException('Customer preference not found');
    }
    return customerPreference;
  }

  @Get('/customer/:id')
  async getCustomerPreferenceByCustomerId(@Param('id', new ParseUUIDPipe()) customerId: string) {
    const customerPreference = await this.notificationService.getCustomerPreferenceByCustomerId(customerId);
    if (!customerPreference) {
      throw new NotFoundException('Customer preference not found');
    }
    return customerPreference;
  }

  @Get('/histories/:id')
  async getCustomerNotificationHistory(@Param('id', new ParseUUIDPipe()) customerId: string) {
    const customerPreference = await this.notificationService.getCustomerNotificationHistory(customerId);
    if (!customerPreference) {
      throw new NotFoundException('Customer preference not found');
    }
    return customerPreference;
  }
}
