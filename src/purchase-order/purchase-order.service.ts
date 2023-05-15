import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  PurchaseOrder,
  PurchaseOrderDocument,
} from './schemas/purchase-order.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { I18nContext } from 'nestjs-i18n';
import {
  Material,
  MaterialDocument,
} from 'src/material/schemas/material.schema';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectModel(PurchaseOrder.name)
    private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,
    @InjectModel(PurchaseOrder.name)
    private readonly purchaseOrderModelPag: PaginateModel<PurchaseOrderDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
  ) {}

  async create(
    req: any,
    dto: CreatePurchaseOrderDto,
    i18n: I18nContext,
  ): Promise<PurchaseOrderDocument> {
    const material = await this.materialModel.count({
      _id: {
        $in: dto.items.map((i) => {
          return i.materialId;
        }),
      },
      supplierId: req.user.supplierId,
    });
    if (material != dto.items.length) {
      throw new BadRequestException(i18n.t(`SOME_ITEMS_NOT_FOUND`));
    }
    const items: any = dto.items;
    let totalCost = 0;
    items.forEach((i) => {
      i.stockValue = i.stock * i.cost;
      totalCost += i.stockValue;
    });
    return await this.purchaseOrderModel.create({
      ...dto,
      items,
      totalCost,
      addedBy: req.user.userId,
      supplierId: req.user.supplierId,
    });
  }

  async findAll(
    req: any,
    query: QueryPurchaseOrderDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PurchaseOrderDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.purchaseOrderModelPag.paginate(
      {
        ...queryToApply,
        supplierId: req.user.supplierId,
        deletedAt: null,
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
    purchaseOrderId: string,
    i18n: I18nContext,
  ): Promise<PurchaseOrderDocument> {
    const exists = await this.purchaseOrderModel.findById(purchaseOrderId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    purchaseOrderId: string,
    dto: UpdatePurchaseOrderDto,
    i18n: I18nContext,
  ): Promise<PurchaseOrderDocument> {
    const purchaseOrder = await this.purchaseOrderModel.findByIdAndUpdate(
      purchaseOrderId,
      dto,
      {
        new: true,
      },
    );

    if (!purchaseOrder) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return purchaseOrder;
  }

  async remove(purchaseOrderId: string, i18n: I18nContext): Promise<boolean> {
    const purchaseOrder = await this.purchaseOrderModel.findByIdAndUpdate(
      purchaseOrderId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!purchaseOrder) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
