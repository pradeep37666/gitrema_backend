import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KitchenQueueService } from './kitchen-queue.service';
import { CreateKitchenQueueDto } from './dto/create-kitchen-queue.dto';
import { UpdateKitchenQueueDto } from './dto/update-kitchen-queue.dto';

@Controller('kitchen-queue')
export class KitchenQueueController {
  constructor(private readonly kitchenQueueService: KitchenQueueService) {}

  @Post()
  create(@Body() createKitchenQueueDto: CreateKitchenQueueDto) {
    return this.kitchenQueueService.create(createKitchenQueueDto);
  }

  @Get()
  findAll() {
    return this.kitchenQueueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kitchenQueueService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKitchenQueueDto: UpdateKitchenQueueDto) {
    return this.kitchenQueueService.update(+id, updateKitchenQueueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kitchenQueueService.remove(+id);
  }
}
