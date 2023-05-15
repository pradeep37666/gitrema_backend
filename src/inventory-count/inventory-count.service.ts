import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryCountDto } from './dto/create-inventory-count.dto';
import { UpdateInventoryCountDto } from './dto/update-inventory-count.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  InventoryCount,
  InventoryCountDocument,
} from './schema/inventory-count.schema';
import { Model, PaginateModel } from 'mongoose';
import { InventoryHelperService } from 'src/inventory/inventory-helper.service';
import { QueryInventoryCountDto } from './dto/query-inventory-count.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { I18nContext } from 'nestjs-i18n';
import { InventoryCountStatus } from './enum/en';

@Injectable()
export class InventoryCountService {
  constructor(
    @InjectModel(InventoryCount.name)
    private readonly inventoryCountModel: Model<InventoryCountDocument>,
    @InjectModel(InventoryCount.name)
    private readonly inventoryCountModelPag: PaginateModel<InventoryCountDocument>,
    private readonly inventoryHelperService: InventoryHelperService,
  ) {}

  async create(
    req: any,
    dto: CreateInventoryCountDto,
  ): Promise<InventoryCountDocument> {
    const inventoryCount = await this.inventoryCountModel.create({
      ...dto,
      addedBy: req.user.userId,
      supplierId: req.user.supplierId,
    });

    return inventoryCount;
  }

  async findAll(
    req: any,
    query: QueryInventoryCountDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<InventoryCountDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.inventoryCountModelPag.paginate(
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
    inventoryCountId: string,
    i18n: I18nContext,
  ): Promise<InventoryCountDocument> {
    const exists = await this.inventoryCountModel.findById(inventoryCountId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    inventoryCountId: string,
    dto: UpdateInventoryCountDto,
    i18n: I18nContext,
  ): Promise<InventoryCountDocument> {
    const inventoryCount = await this.inventoryCountModel.findByIdAndUpdate(
      inventoryCountId,
      dto,
      {
        new: true,
      },
    );

    if (!inventoryCount) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return inventoryCount;
  }

  async changeStatus(
    inventoryCountId: string,
    status: InventoryCountStatus,
    i18n: I18nContext,
  ): Promise<InventoryCountDocument> {
    const inventoryCount = await this.inventoryCountModel.findByIdAndUpdate(
      inventoryCountId,
      { status },
      {
        new: true,
      },
    );

    if (!inventoryCount) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return inventoryCount;
  }

  async applyInventoryCount(
    inventoryCountId: string,

    i18n: I18nContext,
  ): Promise<InventoryCountDocument> {
    const inventoryCount = await this.inventoryCountModel.findById(
      inventoryCountId,
    );

    if (!inventoryCount) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    await this.inventoryHelperService.applyManualCount(inventoryCount);

    inventoryCount.status = InventoryCountStatus.Applied;

    await inventoryCount.save();

    return inventoryCount;
  }

  async remove(inventoryCountId: string, i18n: I18nContext): Promise<boolean> {
    const inventoryCount = await this.inventoryCountModel.findByIdAndDelete(
      inventoryCountId,
    );

    if (!inventoryCount) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
