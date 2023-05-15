import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWasteEventDto } from './dto/create-waste-event.dto';
import { UpdateWasteEventDto } from './dto/update-waste-event.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { I18nContext } from 'nestjs-i18n';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WasteEvent, WasteEventDocument } from './schema/waste-event.schema';
import { InventoryHelperService } from 'src/inventory/inventory-helper.service';
import { QueryWasteEventDto } from './dto/query-waste-event.dto';

@Injectable()
export class WasteEventService {
  constructor(
    @InjectModel(WasteEvent.name)
    private readonly wasteEventModel: Model<WasteEventDocument>,
    @InjectModel(WasteEvent.name)
    private readonly wasteEventModelPag: PaginateModel<WasteEventDocument>,
    private readonly inventoryHelperService: InventoryHelperService,
  ) {}

  async create(
    req: any,
    dto: CreateWasteEventDto,
  ): Promise<WasteEventDocument> {
    const wasteEvent = await this.wasteEventModel.create({
      ...dto,
      addedBy: req.user.userId,
      supplierId: req.user.supplierId,
    });
    this.inventoryHelperService.applyWasteEvent(wasteEvent);
    return wasteEvent;
  }

  async findAll(
    req: any,
    query: QueryWasteEventDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<WasteEventDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.wasteEventModelPag.paginate(
      {
        ...queryToApply,
        supplierId: req.user.supplierId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return records;
  }

  async findOne(
    wasteEventId: string,
    i18n: I18nContext,
  ): Promise<WasteEventDocument> {
    const exists = await this.wasteEventModel.findById(wasteEventId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    wasteEventId: string,
    dto: UpdateWasteEventDto,
    i18n: I18nContext,
  ): Promise<WasteEventDocument> {
    const wasteEvent = await this.wasteEventModel.findByIdAndUpdate(
      wasteEventId,
      dto,
      {
        new: true,
      },
    );

    if (!wasteEvent) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return wasteEvent;
  }

  async remove(wasteEventId: string, i18n: I18nContext): Promise<boolean> {
    const wasteEvent = await this.wasteEventModel.findByIdAndDelete(
      wasteEventId,
    );

    if (!wasteEvent) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
