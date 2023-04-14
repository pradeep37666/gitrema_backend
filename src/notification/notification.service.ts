import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

import * as moment from 'moment';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModelPag: PaginateModel<NotificationDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    return await this.notificationModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    query: QueryNotificationDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<NotificationDocument>> {
    const notifications = await this.notificationModelPag.paginate(
      {
        ...query,
        supplierId: req.user.supplierId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return notifications;
  }

  async findOne(notificationId: string): Promise<NotificationDocument> {
    const exists = await this.notificationModel.findById(notificationId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    notificationId: string,
    dto: UpdateNotificationDto,
  ): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findByIdAndUpdate(
      notificationId,
      dto,
      {
        new: true,
      },
    );

    if (!notification) {
      throw new NotFoundException();
    }

    return notification;
  }

  async remove(notificationId: string): Promise<boolean> {
    const notification = await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException();
    }
    return true;
  }
}
