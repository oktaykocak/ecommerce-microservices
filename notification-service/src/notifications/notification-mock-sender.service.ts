import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationStatus } from './enums/notification-status.enum';
import { Notification } from './entities/notification.entity';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class NotificationMockSenderService {
  private readonly logger = new Logger(NotificationMockSenderService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  @Interval(3000)
  async handleRetry() {
    const notifications = await this.notificationRepository.find({
      where: {
        status: In([NotificationStatus.PENDING, NotificationStatus.FAILED]),
      },
    });

    if (notifications.length === 0) {
      //this.logger.debug('No notifications to retry.');
      return;
    }

    this.logger.log(`Retrying ${notifications.length} notifications...`);

    for (const notification of notifications) {
      await this.sendNotification(notification);
    }
  }

  private async sendNotification(notification: Notification) {
    this.logger.log(
      `Sending notification ${notification.id} to customer ${notification.recipientId} via ${notification.type}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    const isSuccess = Math.random() < 0.7;

    if (isSuccess) {
      notification.status = NotificationStatus.SENT;
      this.logger.log(`Notification ${notification.id} sent successfully.`);
    } else {
        notification.status = NotificationStatus.FAILED;
        this.logger.warn(`Notification ${notification.id} failed.`);
    }

    await this.notificationRepository.save(notification);
  }
}
