import { OrderStatus } from '../enums/order-status.enum';

export class OrderItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
}

export class OrderResponseDto {
  id: string;
  customerId: string;
  status: OrderStatus;
  createdAt: Date;
  items: OrderItemResponseDto[];
}
