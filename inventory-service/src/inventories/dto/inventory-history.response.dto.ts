import { OperationType } from '../enums/operation-type.enum';

export class InventoryHistoryResponseDto {
  id: string;
  operationType: OperationType;
  orderId: string | null;
  newQuantity: number | null;
  oldQuantity: number | null;
  createdAt: Date;
}

export class InventoryResponseDto {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  history: InventoryHistoryResponseDto[];
}