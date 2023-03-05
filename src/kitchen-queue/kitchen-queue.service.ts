import { CreateKitchenQueueDto } from './dto/create-kitchen-queue.dto';
import { UpdateKitchenQueueDto } from './dto/update-kitchen-queue.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import {
  KitchenQueue,
  KitchenQueueDocument,
} from './schemas/kitchen-queue.schema';
import { QueryKitchenQueueDto } from './dto/query-kitchen-queue.dto';
import { User, UserDocument } from 'src/users/schemas/users.schema';

@Injectable()
export class KitchenQueueService {
  constructor(
    @InjectModel(KitchenQueue.name)
    private readonly kitchenQueueModel: Model<KitchenQueueDocument>,
    @InjectModel(KitchenQueue.name)
    private readonly kitchenQueueModelPag: PaginateModel<KitchenQueueDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateKitchenQueueDto,
  ): Promise<KitchenQueueDocument> {
    const kitchenQueue = await this.kitchenQueueModel.findOneAndUpdate(
      { restaurantId: dto.restaurantId },
      {
        ...dto,
        addedBy: req.user.userId,
        supplierId: req.user.supplierId,
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
        sort: { _id: -1 },
        new: true,
      },
    );
    if (kitchenQueue) {
      this.userModel.findByIdAndUpdate(
        { _id: dto.userId },
        { kitchenQueue: kitchenQueue._id },
      );
    }
    return kitchenQueue;
  }

  async findAll(
    req: any,
    query: QueryKitchenQueueDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<KitchenQueueDocument>> {
    const kitchenQueues = await this.kitchenQueueModelPag.paginate(
      {
        ...query,
        deletedAt: null,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return kitchenQueues;
  }

  async findOne(kitchenQueueId: string): Promise<KitchenQueueDocument> {
    const exists = await this.kitchenQueueModel.findById(kitchenQueueId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    kitchenQueueId: string,
    dto: UpdateKitchenQueueDto,
  ): Promise<KitchenQueueDocument> {
    const kitchenQueue = await this.kitchenQueueModel.findByIdAndUpdate(
      kitchenQueueId,
      dto,
      {
        new: true,
      },
    );

    if (!kitchenQueue) {
      throw new NotFoundException();
    }

    if (dto.userId) {
      this.userModel.findByIdAndUpdate(
        { _id: dto.userId },
        { kitchenQueue: kitchenQueue._id },
      );
    }

    return kitchenQueue;
  }

  async remove(kitchenQueueId: string): Promise<boolean> {
    const kitchenQueue = await this.kitchenQueueModel.findByIdAndUpdate(
      kitchenQueueId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!kitchenQueue) {
      throw new NotFoundException();
    }
    return true;
  }
}
