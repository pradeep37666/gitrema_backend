import { Module } from '@nestjs/common';
import { InventoryCountService } from './inventory-count.service';
import { InventoryCountController } from './inventory-count.controller';

@Module({
  controllers: [InventoryCountController],
  providers: [InventoryCountService]
})
export class InventoryCountModule {}
