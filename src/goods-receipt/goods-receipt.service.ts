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
    await this.goodReceiptHelperService.validateGoodsReceipt(dto, i18n);
    const goodsReceipt = await this.goodsReceiptModel.create({
      ...dto,
      addedBy: req.user.userId,
      supplierId: req.user.supplierId,
    });
    this.goodReceiptHelperService.postGoodsReceiptCreate(req, goodsReceipt);
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
