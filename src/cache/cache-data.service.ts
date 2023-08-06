import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table, TableDocument } from 'src/table/schemas/table.schema';
import { InvalidateCacheDto } from './dto/invalidate-cache.dto';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';
import { CacheService } from './cache.service';
import {
  MenuCategory,
  MenuCategoryDocument,
} from 'src/menu/schemas/menu-category.schema';
import {
  MenuAddition,
  MenuAdditionDocument,
} from 'src/menu/schemas/menu-addition.schema';
import {
  Restaurant,
  RestaurantDocument,
} from 'src/restaurant/schemas/restaurant.schema';
import {
  KitchenQueue,
  KitchenQueueDocument,
} from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { restaurantId } from '../../test/constants/test.constant';

@Injectable()
export class CacheDataService {
  constructor(
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(MenuCategory.name)
    private readonly menuCategoryModel: Model<MenuCategoryDocument>,
    @InjectModel(MenuAddition.name)
    private readonly menuAdditionModel: Model<MenuAdditionDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(KitchenQueue.name)
    private readonly kitchenQueueModel: Model<KitchenQueueDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly cacheService: CacheService,
  ) {}

  async invalidateCache(req, dto: InvalidateCacheDto) {
    // cache supplier
    const supplier = await this.supplierModel.findById(dto.supplierId).lean();
    if (!supplier) {
      throw new NotFoundException();
    }
    await this.cacheService.set(supplier._id.toString(), supplier);

    // cache menu categories
    const menuCategories = await this.menuCategoryModel
      .find({
        supplierId: dto.supplierId,
      })
      .lean();
    for (const i in menuCategories) {
      await this.cacheService.set(
        menuCategories[i]._id.toString(),
        menuCategories[i],
      );
    }

    // cache menu additions
    const menuAdditions = await this.menuAdditionModel
      .find({
        supplierId: dto.supplierId,
      })
      .lean();
    for (const i in menuAdditions) {
      await this.cacheService.set(
        menuAdditions[i]._id.toString(),
        menuAdditions[i],
      );
    }

    // cache restaurants
    const restaurants = await this.restaurantModel
      .find({
        supplierId: dto.supplierId,
      })
      .lean();
    for (const i in restaurants) {
      await this.cacheService.set(
        restaurants[i]._id.toString(),
        restaurants[i],
      );
    }

    // cache kitchenqueue
    const kitchenQueues = await this.kitchenQueueModel
      .find({
        supplierId: dto.supplierId,
      })
      .lean();
    for (const i in kitchenQueues) {
      await this.cacheService.set(
        kitchenQueues[i]._id.toString(),
        kitchenQueues[i],
      );
      if (kitchenQueues[i].default) {
        await this.cacheService.set(
          kitchenQueues[i].restaurantId.toString() + '_defaultKitchenQueue',
          kitchenQueues[i],
        );
      }
    }

    // cache last order number
    const order = await this.orderModel.findOne(
      { supplierId: dto.supplierId },
      {},
      { sort: { _id: -1 } },
    );
    if (order) {
      await this.cacheService.set(
        supplier._id.toString() + '_lastOrderNumber',
        order.orderNumber,
      );
    }
  }
}
