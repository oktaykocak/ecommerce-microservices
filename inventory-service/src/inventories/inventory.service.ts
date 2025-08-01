import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { Inventory } from './entities/inventory.entity';
import { EventEmitterService } from 'src/events/EventEmitterService';
import { InventoryOperation } from './entities/inventory-operation.entity';
import { OperationType } from './enums/operation-type.enum';
import { InventoryResponseDto } from './dto/inventory-history.response.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,

    @InjectRepository(InventoryOperation)
    private readonly inventoryOperationRepository: Repository<InventoryOperation>,
    private readonly dataSource: DataSource,

    private readonly eventEmitter: EventEmitterService,
  ) {}

  async createInventory(dto: CreateInventoryDto): Promise<Inventory> {
    return await this.dataSource.transaction(async (manager) => {
      const preSavedInventory: Inventory = {
        id: uuidv4(),
        name: dto.name || '',
        sku: dto.sku || '',
        quantity: dto.quantity,
      };
      const preSavedInventoryOperation: InventoryOperation = {
        id: uuidv4(),
        operationType: OperationType.STOCK_CREATED,
        orderId: null,
        newQuantity: dto.quantity,
        oldQuantity: 0,
        productId: preSavedInventory.id,
        createdAt: new Date(),
      };
      let ignoreStockUpdateOperation = false;
      if (dto.id) {
        const inventory = await this.inventoryRepository.findOneBy({
          id: dto.id,
        });
        if (!inventory) {
          this.logger.error(`Inventory can not found. Id: ${dto.id}`);
          throw new NotFoundException('Inventory can not found');
        }
        preSavedInventory.id = inventory.id;
        preSavedInventory.name = dto.name?.trim() ? dto.name : inventory.name;
        preSavedInventory.sku = dto.sku?.trim() ? dto.sku : inventory.sku;
        if (inventory.quantity != dto.quantity) {
          preSavedInventoryOperation.operationType =
            OperationType.STOCK_UPDATED;
          preSavedInventoryOperation.oldQuantity = inventory.quantity;
          preSavedInventoryOperation.productId = dto.id;
        } else ignoreStockUpdateOperation = true;
      }

      try {
        if (!ignoreStockUpdateOperation)
          await manager.save(InventoryOperation, preSavedInventoryOperation);
        const savedInventory = await manager.save(Inventory, preSavedInventory);
        return savedInventory;
      } catch (error) {
        if (error.code === '23505') {
          // 23505: unique_violation
          throw new ConflictException(
            'Duplicate entry: SKU or Name unique field already exists',
          );
        }
        throw new InternalServerErrorException('Failed to save inventory');
      }
    });
  }

  async getInventory(inventoryId: string): Promise<Inventory | null> {
    const inventory = await this.inventoryRepository.findOneBy({
      id: inventoryId,
    });
    return inventory || null;
  }

  async getInventories(
    searchTerm: string | undefined,
  ): Promise<Array<Inventory> | null> {
    const where = searchTerm
      ? [{ name: ILike(`%${searchTerm}%`) }, { sku: ILike(`%${searchTerm}%`) }]
      : {};
    return this.inventoryRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async getInventoryWithHistory(
    inventoryId: string,
  ): Promise<InventoryResponseDto | null> {
    const inventory = await this.inventoryRepository.findOneBy({
      id: inventoryId,
    });
    if (inventory) {
      const inventoryHistory = await this.inventoryOperationRepository.findBy({
        productId: inventoryId,
      });
      const inventoryWithHistory: InventoryResponseDto = {
        ...inventory,
        history: inventoryHistory,
      };
      return inventoryWithHistory;
    }
    return null;
  }

  async processOrderCreatedInventory(
    orderId: string,
    customerId: string,
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<boolean> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const operationList = await this.inventoryOperationRepository.findBy({
          orderId,
        });
        if (operationList.length > 0) {
          this.logger.error(`Inventory is already processed. OrderId: ${orderId}`);
          return false;
        }

        let message: string = '';
        let allProductAvailable = true;
        let preSavedOperationList: InventoryOperation[] = [];
        for (const item of items) {
          const inventory = await this.inventoryRepository.findOneBy({
            id: item.productId,
          });
          if (!inventory) {
            message = `Product not found: ${item.productId}`;
            allProductAvailable = false;
          } else if (inventory.quantity < item.quantity) {
            message = `Insufficient stock: ${item.quantity} for item: ${item.productId}`;
            allProductAvailable = false;
          } else {
            const preSavedInventoryOperation: InventoryOperation = {
              id: uuidv4(),
              operationType: OperationType.ORDER_OPERATION_COMPLETED,
              orderId,
              newQuantity: inventory.quantity - item.quantity,
              oldQuantity: inventory.quantity,
              productId: item.productId,
              createdAt: new Date(),
            };
            preSavedOperationList.push(preSavedInventoryOperation);
          }
          if (!allProductAvailable) break;
        }

        if (allProductAvailable) {
          const decrementPromises = items.map((item) =>
            manager.decrement(
              Inventory,
              { id: item.productId },
              'quantity',
              item.quantity,
            ),
          );
          const operationListPromises = preSavedOperationList.map((operation) =>
            manager.save(InventoryOperation, operation),
          );
          await Promise.all([...decrementPromises, ...operationListPromises]);
          await this.eventEmitter.publishOrderCompleted(orderId);
          await this.eventEmitter.publishNotification(customerId, 'Order Completed');
          return true;
        } else {
          const rejectedOperationsPromises = items.map((item) => {
            const rejectedOperation: InventoryOperation = {
              id: uuidv4(),
              operationType: OperationType.ORDER_OPERATION_REJECTED,
              orderId,
              productId: item.productId,
              newQuantity: null,
              oldQuantity: null,
              createdAt: new Date(),
            };
            return manager.save(InventoryOperation, rejectedOperation);
          });
          await Promise.all(rejectedOperationsPromises);
          await this.eventEmitter.publishOrderRejected(orderId, message);
          await this.eventEmitter.publishNotification(customerId, 'Order Rejected');
          return false;
        }
      } catch (error) {
        this.logger.error(`Internal error during inventory processing. Error: ${error}`);
        await this.eventEmitter.publishOrderRejected(
          orderId,
          'Internal error during inventory processing',
        );
        await this.eventEmitter.publishNotification(customerId, 'Order Rejected');
        return false;
      }
    });
  }

  async processOrderCancelledInventory(
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<boolean> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const operationList = await this.inventoryOperationRepository.findBy({
          orderId,
        });
        let stockWillUpdate = false;
        if (operationList.length > 0) {
          if (
            operationList.some(
              (operation) =>
                operation.operationType ===
                  OperationType.ORDER_OPERATION_REJECTED ||
                operation.operationType ===
                  OperationType.ORDER_OPERATION_CANCELLED,
            )
          ) {
            this.logger.warn(`Order is already rejected or cancelled, no need update.`);
            return true;
          } else {
            stockWillUpdate = true;
          }
        }
        for (const item of items) {
          if (stockWillUpdate) {
            const operation = operationList.find(
              (operation) => operation.productId == item.productId,
            );
            const inventory = await this.inventoryRepository.findOneBy({
              id: item.productId,
            });
            if (!inventory) {
              this.logger.error(`Product can not found: ${item.productId} for this order: ${orderId}`);
              throw `Product can not found: ${item.productId} for this order: ${orderId}`;
            }
            const oldQuantity = Number(inventory.quantity);
            const newQuantity =
              oldQuantity +
              (Number(operation?.oldQuantity || 0) -
                Number(operation?.newQuantity || 0));
            const preSavedInventoryOperation: InventoryOperation = {
              id: uuidv4(),
              operationType: OperationType.ORDER_OPERATION_CANCELLED,
              orderId,
              newQuantity,
              oldQuantity,
              productId: item.productId,
              createdAt: new Date(),
            };
            inventory.quantity = newQuantity;
            await manager.save(Inventory, inventory);
            await manager.save(InventoryOperation, preSavedInventoryOperation)
          } else {
            const preSavedInventoryOperation: InventoryOperation = {
              id: uuidv4(),
              operationType: OperationType.ORDER_OPERATION_CANCELLED,
              orderId,
              newQuantity: null,
              oldQuantity: null,
              productId: item.productId,
              createdAt: new Date(),
            };
            await manager.save(InventoryOperation, preSavedInventoryOperation);
          }
        }
        return true;
      } catch (error) {
        this.logger.error(`Internal error during inventory processing. Error: ${error}`);
        return false;
      }
    });
  }
}
