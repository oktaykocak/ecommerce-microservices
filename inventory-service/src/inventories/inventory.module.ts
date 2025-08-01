import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { EventEmitterService } from 'src/events/EventEmitterService';
import { InventoryOperation } from './entities/inventory-operation.entity';
import { InventoryEventsConsumer } from './inventory.events.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, InventoryOperation])],
  controllers: [InventoryController, InventoryEventsConsumer],
  providers: [InventoryService, EventEmitterService],
})
export class InventoryModule {}
