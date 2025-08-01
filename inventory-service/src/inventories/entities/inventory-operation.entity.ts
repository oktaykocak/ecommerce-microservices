import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { OperationType } from '../enums/operation-type.enum';

@Entity('inventory_operations')
export class InventoryOperation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
  })
  operationType: OperationType;

  @Column('uuid', { nullable: true })
  orderId: string | null;

  @Column('uuid')
  productId: string;

  @Column('decimal', { nullable: true })
  newQuantity: number | null;

  @Column('decimal', { nullable: true })
  oldQuantity: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
