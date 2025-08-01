import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  sku: string;

  @Column('decimal')
  quantity: number;
}
