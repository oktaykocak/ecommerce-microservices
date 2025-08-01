import {
  Controller,
  Post,
  Body,
  Param,
  NotFoundException,
  Get,
  Delete,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get('/customer/:customerId')
  async getOrdersByCustomerId(
    @Param('customerId', new ParseUUIDPipe()) customerId: string,
  ) {
    return await this.orderService.getOrdersByCustomerId(customerId);
  }

  @Get(':id')
  async getOrder(@Param('id', new ParseUUIDPipe()) id: string) {
    const order = await this.orderService.getOrder(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  @Get()
  async getOrders() {
    const orders = await this.orderService.getOrders();
    return orders;
  }

  @Delete(':id')
  @HttpCode(204)
  async cancelOrder(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.orderService.cancelOrder(id);
    if (!result) {
      throw new NotFoundException('Order not found');
    }
    return { message: 'Order cancelled successfully' };
  }
}
