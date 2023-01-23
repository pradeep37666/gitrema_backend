import { Injectable } from '@nestjs/common';
import { CreateKitchenQueueDto } from './dto/create-kitchen-queue.dto';
import { UpdateKitchenQueueDto } from './dto/update-kitchen-queue.dto';

@Injectable()
export class KitchenQueueService {
  create(createKitchenQueueDto: CreateKitchenQueueDto) {
    return 'This action adds a new kitchenQueue';
  }

  findAll() {
    return `This action returns all kitchenQueue`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kitchenQueue`;
  }

  update(id: number, updateKitchenQueueDto: UpdateKitchenQueueDto) {
    return `This action updates a #${id} kitchenQueue`;
  }

  remove(id: number) {
    return `This action removes a #${id} kitchenQueue`;
  }
}
