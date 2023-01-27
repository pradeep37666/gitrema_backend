import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QueryActivityDto } from './dto/query-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(Activity.name)
    private readonly activityModelPag: PaginateModel<ActivityDocument>,
  ) {}

  async create(req: any, dto: CreateActivityDto): Promise<ActivityDocument> {
    return await this.activityModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    query: QueryActivityDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ActivityDocument>> {
    const activities = await this.activityModelPag.paginate(
      {
        supplierId: req.user.supplierId,
        ...query,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return activities;
  }

  async findOne(activityId: string): Promise<ActivityDocument> {
    const exists = await this.activityModel.findById(activityId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    activityId: string,
    dto: UpdateActivityDto,
  ): Promise<ActivityDocument> {
    const activity = await this.activityModel.findByIdAndUpdate(
      activityId,
      dto,
      {
        new: true,
      },
    );

    if (!activity) {
      throw new NotFoundException();
    }

    return activity;
  }

  async remove(activityId: string): Promise<boolean> {
    const activity = await this.activityModel.findByIdAndDelete(activityId);

    if (!activity) {
      throw new NotFoundException();
    }
    return true;
  }
}
