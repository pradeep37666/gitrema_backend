import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { CreateWaitingQueueDto } from './dto/create-waiting-queue.dto';
import { UpdateWaitingQueueDto } from './dto/update-waiting-queue.dto';
import {
  WaitingQueue,
  WaitingQueueDocument,
} from './schemas/waiting-queue.schema';
import { QueryWaitingQueueDto } from './dto/query-waiting-queue.dto';

@Injectable()
export class WaitingQueueService {
  constructor(
    @InjectModel(WaitingQueue.name)
    private readonly waitingQueueModel: Model<WaitingQueueDocument>,
    @InjectModel(WaitingQueue.name)
    private readonly waitingQueueModelPag: PaginateModel<WaitingQueueDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateWaitingQueueDto,
  ): Promise<WaitingQueueDocument> {
    return await this.waitingQueueModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    query: QueryWaitingQueueDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<WaitingQueueDocument>> {
    const waitingQueues = await this.waitingQueueModelPag.paginate(
      {
        supplierId: req.user.supplierId,
        ...query,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          { path: 'restaurantId', select: { name: 1, nameAr: 1 } },
          { path: 'customerId', select: { name: 1 } },
          { path: 'tableRegion', select: { name: 1, nameAr: 1 } },
        ],
      },
    );
    return waitingQueues;
  }

  async findOne(waitingQueueId: string): Promise<WaitingQueueDocument> {
    const exists = await this.waitingQueueModel
      .findById(waitingQueueId)
      .populate([
        { path: 'restaurantId', select: { name: 1, nameAr: 1 } },
        { path: 'customerId', select: { name: 1 } },
        { path: 'tableRegion', select: { name: 1, nameAr: 1 } },
      ]);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    waitingQueueId: string,
    dto: UpdateWaitingQueueDto,
  ): Promise<WaitingQueueDocument> {
    const waitingQueue = await this.waitingQueueModel.findByIdAndUpdate(
      waitingQueueId,
      dto,
      {
        new: true,
      },
    );

    if (!waitingQueue) {
      throw new NotFoundException();
    }

    return waitingQueue;
  }

  async remove(waitingQueueId: string): Promise<boolean> {
    const waitingQueue = await this.waitingQueueModel.findByIdAndRemove(
      waitingQueueId,
    );

    if (!waitingQueue) {
      throw new NotFoundException();
    }
    return true;
  }
}
