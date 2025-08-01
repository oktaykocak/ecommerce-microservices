import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterService } from 'src/events/EventEmitterService';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './entities/notification.entity';
import { CustomerNotificationPreference } from './entities/customer-notification-preference.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationMockSenderService } from './notification-mock-sender.service';
import { NotificationEventsConsumer } from './notification.events.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, CustomerNotificationPreference]),
    ScheduleModule.forRoot(),
  ],
  controllers: [NotificationController, NotificationEventsConsumer],
  providers: [NotificationService, EventEmitterService, NotificationMockSenderService],
})
export class NotificationModule {}
