import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEmitterService } from 'src/events/EventEmitterService';
import { CustomerNotificationPreference } from './entities/customer-notification-preference.entity';
import { CreateNotificationPreferenceDto } from './dto/create-notification-preference.dto';
import { NotificationStatus } from './enums/notification-status.enum';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationCustomerResponseDto } from './dto/notification-history.response.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(CustomerNotificationPreference)
    private readonly customerNotificationPreferenceRepository: Repository<CustomerNotificationPreference>,
    private readonly dataSource: DataSource,

    private readonly eventEmitter: EventEmitterService,
  ) {}

  async createCustomerPreference(
    dto: CreateNotificationPreferenceDto,
  ): Promise<CustomerNotificationPreference> {
    return await this.dataSource.transaction(async (manager) => {
      const preSavedCustomerPreference: CustomerNotificationPreference = {
        id: uuidv4(),
        ...dto,
        createdAt: new Date(),
      };
      if (dto.id) {
        const customerPreference =
          await this.customerNotificationPreferenceRepository.findOneBy({
            id: dto.id,
          });
        if (!customerPreference) {
          this.logger.error(`Customer Notificaton Preference can not found. Id: ${dto.id}`);
          throw new NotFoundException(
            'Customer Notificaton Preference can not found',
          );
        }
        preSavedCustomerPreference.createdAt = customerPreference.createdAt;
      }

      try {
        const savedCustomerPreference = await manager.save(
          CustomerNotificationPreference,
          preSavedCustomerPreference,
        );
        return savedCustomerPreference;
      } catch (error) {
        if (error.code === '23505') {
          // 23505: unique_violation
          throw new ConflictException(
            'Duplicate entry: Customer Id unique field already exists',
          );
        }
        throw new InternalServerErrorException(
          'Failed to save customer preference',
        );
      }
    });
  }

  async getCustomerPreferenceById(
    id: string,
  ): Promise<CustomerNotificationPreference | null> {
    const customerPreference =
      await this.customerNotificationPreferenceRepository.findOneBy({
        id,
      });
    return customerPreference || null;
  }

  async getCustomerPreferenceByCustomerId(
    customerId: string,
  ): Promise<CustomerNotificationPreference | null> {
    const customerPreference =
      await this.customerNotificationPreferenceRepository.findOneBy({
        customerId,
      });
    return customerPreference || null;
  }

  async getCustomerNotificationHistory(
    customerId: string,
  ): Promise<NotificationCustomerResponseDto | null> {
    const customerPreference =
      await this.customerNotificationPreferenceRepository.findOneBy({
        customerId,
      });
    if(customerPreference){
      const history = await this.notificationRepository.find({
        where: {recipientId:customerId},  
      });
      const preferenceWithNotificationHistory: NotificationCustomerResponseDto = {
        ...customerPreference,
        notifications: history,
      };
      return preferenceWithNotificationHistory;
    }
    return customerPreference || null;
  }

  async processCreateNotification(
    customerId: string,
    message: string,
  ): Promise<boolean> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const customerPreference =
          await this.customerNotificationPreferenceRepository.findOneBy({
            customerId,
          });
        if (!customerPreference) {
          this.logger.error(`Customer Notificaton Preference can not found. CustomerId: ${customerId}`);
          throw `Customer not found: ${customerId}`;
        }
        if (customerPreference.emailEnabled) {
          const preSavedEmailNotif: Notification = {
            id: uuidv4(),
            recipientId: customerId,
            message,
            status: NotificationStatus.PENDING,
            type: NotificationType.EMAIL,
            createdAt: new Date(),
          };
          await manager.save(Notification, preSavedEmailNotif);
        }
        if (customerPreference.smsEnabled) {
          const preSavedSmsNotif: Notification = {
            id: uuidv4(),
            recipientId: customerId,
            message,
            status: NotificationStatus.PENDING,
            type: NotificationType.SMS,
            createdAt: new Date(),
          };
          await manager.save(Notification, preSavedSmsNotif);
        }
        if (customerPreference.pushEnabled) {
          const preSavedPushNotif: Notification = {
            id: uuidv4(),
            recipientId: customerId,
            message,
            status: NotificationStatus.PENDING,
            type: NotificationType.PUSH,
            createdAt: new Date(),
          };
          await manager.save(Notification, preSavedPushNotif);
        }
        return true;
      } catch (error) {
        this.logger.error(`Notification create processing error:${error}`);
        return false;
      }
    });
  }
}
