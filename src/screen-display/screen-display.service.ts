import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateScreenDisplayDto } from './dto/create-screen-display.dto';
import { UpdateScreenDisplayDto } from './dto/update-screen-display.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  ScreenDisplay,
  ScreenDisplayDocument,
} from './schemas/screen-display.schema';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

@Injectable()
export class ScreenDisplayService {
  constructor(
    @InjectModel(ScreenDisplay.name)
    private readonly screenDisplayModel: Model<ScreenDisplayDocument>,

    @InjectModel(ScreenDisplay.name)
    private readonly screenDisplayModelPag: PaginateModel<ScreenDisplayDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateScreenDisplayDto,
  ): Promise<ScreenDisplayDocument> {
    return await this.screenDisplayModel.create({
      ...dto,

      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ScreenDisplayDocument>> {
    const screenDisplays = await this.screenDisplayModelPag.paginate(
      {},
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return screenDisplays;
  }

  async update(
    screenDisplayId: string,
    dto: UpdateScreenDisplayDto,
  ): Promise<ScreenDisplayDocument> {
    const screenDisplay = await this.screenDisplayModel.findByIdAndUpdate(
      screenDisplayId,
      dto,
      { new: true },
    );

    if (!screenDisplay) {
      throw new NotFoundException();
    }

    return screenDisplay;
  }

  async remove(screenDisplayId: string): Promise<boolean> {
    const screenDisplay = await this.screenDisplayModel.findByIdAndRemove(
      screenDisplayId,
    );

    if (!screenDisplay) {
      throw new NotFoundException();
    }
    return true;
  }
}
