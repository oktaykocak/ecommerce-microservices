import { NotificationStatus } from "../enums/notification-status.enum";
import { NotificationType } from "../enums/notification-type.enum";

export class NotificationHistoryResponseDto {
  id: string;
  recipientId: string;
  type: NotificationType;
  message: string;
  status: NotificationStatus;
  createdAt: Date;
}

export class NotificationCustomerResponseDto{
    id: string;
    customerId: string;
    emailEnabled: boolean;
    email: string | null;
    smsEnabled: boolean;
    phoneNumber: string | null;
    pushEnabled: boolean;
    deviceId: string | null;
    notifications: NotificationHistoryResponseDto[];
    createdAt: Date;
}