import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  GoodsReceipt,
  GoodsReceiptDocument,
} from './schemas/goods-receipt.schema';
import { QueryGoodsReceiptDto } from './dto/query-goods-receipt.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { I18nContext } from 'nestjs-i18n';
import { GoodsReceiptHelperService } from './goods-receipt-helper.service';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { Tax } from 'src/core/Constants/tax-rate.constant';

@Injectable()
export class GoodsReceiptService {
  constructor(
    @InjectModel(GoodsReceipt.name)
    private readonly goodsReceiptModel: Model<GoodsReceiptDocument>,
    @InjectModel(GoodsReceipt.name)
    private readonly goodsReceiptModelPag: PaginateModel<GoodsReceiptDocument>,
    private readonly goodReceiptHelperService: GoodsReceiptHelperService,
  ) {}

  async create(
    req: any,
    dto: CreateGoodsReceiptDto,
    i18n: I18nContext,
  ): Promise<GoodsReceiptDocument> {
    const loaded = await this.goodReceiptHelperService.validateGoodsReceipt(
      dto,
      i18n,
    );
    const items: any = dto.items;
    let totalCost = 0;
    items.forEach((i) => {
      const itemTaxableAmount = roundOffNumber(i.cost / (1 + Tax.rate / 100));
      i.tax = (itemTaxableAmount * Tax.rate) / 100;
      i.netPrice = itemTaxableAmount;
      i.stockValue = i.stock * i.cost;
      totalCost += i.stockValue;
    });
    const totalTaxableAmount = roundOffNumber(totalCost / (1 + Tax.rate / 100));
    const tax = (totalTaxableAmount * Tax.rate) / 100;
    let goodsReceipt: GoodsReceiptDocument =
      await this.goodsReceiptModel.create({
        ...dto,
        items,
        totalCost,
        tax,
        addedBy: req.user.userId,
        supplierId: req.user.supplierId,
      });
    goodsReceipt = await this.goodReceiptHelperService.postGoodsReceiptCreate(
      req,
      goodsReceipt,
      loaded,
    );
    return goodsReceipt;
  }

  async findAll(
    req: any,
    query: QueryGoodsReceiptDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<GoodsReceiptDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.goodsReceiptModelPag.paginate(
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
    goodsReceiptId: string,
    i18n: I18nContext,
  ): Promise<GoodsReceiptDocument> {
    const exists = await this.goodsReceiptModel.findById(goodsReceiptId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    goodsReceiptId: string,
    dto: UpdateGoodsReceiptDto,
    i18n: I18nContext,
  ): Promise<GoodsReceiptDocument> {
    const goodsReceipt = await this.goodsReceiptModel.findByIdAndUpdate(
      goodsReceiptId,
      dto,
      {
        new: true,
      },
    );

    if (!goodsReceipt) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return goodsReceipt;
  }

  async remove(goodsReceiptId: string, i18n: I18nContext): Promise<boolean> {
    const goodsReceipt = await this.goodsReceiptModel.findByIdAndUpdate(
      goodsReceiptId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!goodsReceipt) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
