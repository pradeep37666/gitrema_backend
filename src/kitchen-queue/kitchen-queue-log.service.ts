import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

import {
  KitchenQueueLog,
  KitchenQueueLogDocument,
} from './schemas/kitchen-queue-log.schema';
import { PauseDto } from 'src/cashier/dto/pause.dto';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';

@Injectable()
export class KitchenQueueLogService {
  constructor(
    @InjectModel(KitchenQueueLog.name)
    private readonly kitchenQueueLogModel: Model<KitchenQueueLogDocument>,

    @InjectModel(KitchenQueueLog.name)
    private readonly kitchenQueueLogModelPag: PaginateModel<KitchenQueueLogDocument>,
  ) {}

  async current(kitchenQueueId: string): Promise<KitchenQueueLogDocument> {
    const exists = await this.kitchenQueueLogModel.findOne(
      { kitchenQueueId },
      {},
      { sort: { _id: -1 } },
    );

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async logs(
    req: any,
    kitchenQueueId: string,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<KitchenQueueLogDocument>> {
    const kitchenQueueLogs = await this.kitchenQueueLogModelPag.paginate(
      {
        kitchenQueueId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return kitchenQueueLogs;
  }

  async start(
    req: any,
    kitchenQueueId: string,
  ): Promise<KitchenQueueLogDocument> {
    const kitchenQueueLog = await this.kitchenQueueLogModel.findOne(
      { kitchenQueueId },
      {},
      { sort: { _id: -1 } },
    );

    if (kitchenQueueLog && !kitchenQueueLog.closedAt) {
      throw new BadRequestException(
        VALIDATION_MESSAGES.PreviousOpenInstance.key,
      );
    }
    return await this.kitchenQueueLogModel.create({
      kitchenQueueId,
      startedAt: new Date(),
      supplierId: req.user.supplierId,
    });
  }

  async close(
    req: any,
    kitchenQueueId: string,
  ): Promise<KitchenQueueLogDocument> {
    const kitchenQueueLog = await this.kitchenQueueLogModel.findOne(
      { kitchenQueueId },
      {},
      { sort: { _id: -1 } },
    );

    if (kitchenQueueLog && kitchenQueueLog.closedAt) {
      throw new BadRequestException(VALIDATION_MESSAGES.NoOpenInstance.key);
    }

    kitchenQueueLog.set({ closedAt: new Date() });
    await kitchenQueueLog.save();
    return kitchenQueueLog;
  }

  async pause(
    kitchenQueueId: string,
    dto: PauseDto = null,
  ): Promise<KitchenQueueLogDocument> {
    const kitchenQueueLog = await this.kitchenQueueLogModel.findOne(
      { kitchenQueueId },
      {},
      { sort: { _id: -1 } },
    );
    if (!kitchenQueueLog) {
      throw new NotFoundException();
    }
    if (dto) {
      if (kitchenQueueLog.pausedLogs.length > 0) {
        const lastItem = kitchenQueueLog.pausedLogs.at(-1);
        if (!lastItem.end) {
          throw new BadRequestException(VALIDATION_MESSAGES.AlreadyPaused.key);
        }
      }
      kitchenQueueLog.pausedLogs.push({ ...dto, start: new Date() });
    } else {
      if (kitchenQueueLog.pausedLogs.length == 0) {
        throw new BadRequestException(VALIDATION_MESSAGES.NothingToResume.key);
      }
      const lastItem = kitchenQueueLog.pausedLogs.at(-1);
      if (lastItem.end) {
        throw new BadRequestException(VALIDATION_MESSAGES.NothingToResume.key);
      }
      lastItem.end = new Date();
      kitchenQueueLog.pausedLogs[kitchenQueueLog.pausedLogs.length - 1] =
        lastItem;
    }
    await kitchenQueueLog.save();

    return kitchenQueueLog;
  }
}
