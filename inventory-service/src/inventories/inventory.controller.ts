import {
  Controller,
  Post,
  Body,
  Param,
  NotFoundException,
  Get,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryService } from './inventory.service';

@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.createInventory(createInventoryDto);
  }

  @Get(':id')
  async getInventory(@Param('id', new ParseUUIDPipe()) id: string) {
    const inventory = await this.inventoryService.getInventory(id);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }
    return inventory;
  }

  @Get()
  async getInventories(@Query('searchTerm') searchTerm?: string) {
    const inventories = await this.inventoryService.getInventories(searchTerm);
    return inventories;
  }

  @Get('/histories/:id')
  async getInventoryWithHistory(@Param('id', new ParseUUIDPipe()) id: string) {
    const inventory = await this.inventoryService.getInventoryWithHistory(id);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }
    return inventory;
  }
}
