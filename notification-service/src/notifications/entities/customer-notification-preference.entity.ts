import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('customer_notification_preferences')
export class CustomerNotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  customerId: string;

  @Column('boolean', { default: true })
  emailEnabled: boolean;

  @Column('varchar', { nullable: true })
  email: string | null;

  @Column('boolean', { default: false })
  smsEnabled: boolean;

  @Column('varchar', { nullable: true })
  phoneNumber: string | null;

  @Column('boolean', { default: true })
  pushEnabled: boolean;

  @Column('varchar', { nullable: true })
  deviceId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
