import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { EventEmitterService } from '../events/event-emitter.service';
import { v4 as uuidv4 } from 'uuid';
import { OrderStatus } from './enums/order-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly eventEmitter: EventEmitterService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const { customerId, items } = dto;

    const order = new Order();
    order.id = uuidv4();
    order.customerId = customerId;
    order.status = OrderStatus.PENDING;
    order.createdAt = new Date();

    const orderItems: OrderItem[] = items.map((item) => {
      const orderItem = new OrderItem();
      orderItem.id = uuidv4();
      orderItem.productId = item.productId;
      orderItem.quantity = item.quantity;
      orderItem.order = order;
      return orderItem;
    });

    order.items = orderItems;

    const savedOrder = await this.orderRepository.save(order);
    const orderResponse: OrderResponseDto = {
      id: savedOrder.id,
      customerId: savedOrder.customerId,
      status: savedOrder.status,
      createdAt: savedOrder.createdAt,
      items: savedOrder.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    };
    await this.eventEmitter.emitOrderCreated(orderResponse);

    return orderResponse;
  }

  async getOrder(orderId: string): Promise<OrderResponseDto | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    return order || null;
  }

  async getOrders(): Promise<Array<OrderResponseDto> | null> {
    return await this.orderRepository.find({ relations: ['items'] });
  }

  async getOrdersByCustomerId(customerId: string): Promise<Array<Order>> {
    return await this.orderRepository.find({
      where: { customerId },
      relations: ['items'],
    });
  }

  async cancelOrder(orderId: string): Promise<Order | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      this.logger.error(`Order can not found. OrderId: ${orderId}`);
      return null;
    } else if (order.status == OrderStatus.CANCELLED || order.status == OrderStatus.REJECTED) {
      return order;
    }

    order.status = OrderStatus.CANCELLED;
    const updatedOrder = await this.orderRepository.save(order);

    await this.eventEmitter.emitOrderCancelled(order);

    return updatedOrder;
  }

  async processOrderCompleted(orderId: string): Promise<boolean> {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if(order){
      if(order.status == OrderStatus.PENDING){
        order.status = OrderStatus.COMPLETED;
        const updatedOrder = await this.orderRepository.save(order);
        return true;
      }else {
        this.logger.warn(`Order(id:${orderId}) status is already changed. Status: ${order.status}`);
        return false;
      }
    }else {
      this.logger.error(`Order can not found. OrderId: ${orderId}`);
      throw new NotFoundException('Order can not found');
    }
  }

  async processOrderRejected(orderId: string): Promise<boolean> {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if(order){
      if(order.status == OrderStatus.PENDING){
        order.status = OrderStatus.REJECTED;
        const updatedOrder = await this.orderRepository.save(order);
        return true;
      }else {
        this.logger.warn(`Order(id:${orderId}) status is already changed. Status: ${order.status}`);
        return false;
      }
    }else {
      this.logger.error(`Order can not found. OrderId: ${orderId}`);
      throw new NotFoundException('Order not found');
    }
  }
}
