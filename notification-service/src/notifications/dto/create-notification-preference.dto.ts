import { IsBoolean, IsNotEmpty, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class CreateNotificationPreferenceDto {
  @IsUUID(4)
  @IsOptional()
  id?: string;

  @IsUUID(4)
  customerId: string;

  @IsBoolean()
  emailEnabled: boolean;

  @ValidateIf((o) => o.emailEnabled)
  @IsNotEmpty({ message: 'Email is required when email notification is enabled'})
  email: string | null;

  @IsBoolean()
  smsEnabled: boolean;

  @ValidateIf((o) => o.smsEnabled)
  @IsNotEmpty({ message: 'Phone number is required when sms notification is enabled'})
  phoneNumber: string | null;

  @IsBoolean()
  pushEnabled: boolean;

  @ValidateIf((o) => o.pushEnabled)
  @IsNotEmpty({ message: 'Device id is required when push notification is enabled'})
  deviceId: string | null;
}
