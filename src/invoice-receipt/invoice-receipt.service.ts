import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvoiceReceiptDto } from './dto/create-invoice-receipt.dto';
import { UpdateInvoiceReceiptDto } from './dto/update-invoice-receipt.dto';
import {
  InvoiceReceipt,
  InvoiceReceiptDocument,
} from './schema/invoice-receipt.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { I18nContext } from 'nestjs-i18n';
import { QueryInvoiceReceiptDto } from './dto/query-invoice-receipt.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MongooseQueryParser } from 'mongoose-query-parser';
import {
  GoodsReceipt,
  GoodsReceiptDocument,
} from 'src/goods-receipt/schemas/goods-receipt.schema';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { Tax } from 'src/core/Constants/tax-rate.constant';

@Injectable()
export class InvoiceReceiptService {
  constructor(
    @InjectModel(InvoiceReceipt.name)
    private readonly invoiceReceiptModel: Model<InvoiceReceiptDocument>,
    @InjectModel(InvoiceReceipt.name)
    private readonly invoiceReceiptModelPag: PaginateModel<InvoiceReceiptDocument>,
    @InjectModel(GoodsReceipt.name)
    private readonly goodsReceiptModel: Model<GoodsReceiptDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateInvoiceReceiptDto,
    i18n: I18nContext,
  ): Promise<InvoiceReceiptDocument> {
    const exists = await this.invoiceReceiptModel.findOne({
      purchaseOrderId: dto.purchaseOrderId,
    });
    if (exists) {
      throw new NotFoundException(i18n.t('error.RECORD_ALREADY_EXIST'));
    }
    const goodsReceipts = await this.validate(dto, i18n);
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
    const invoiceReceipt = await this.invoiceReceiptModel.create({
      ...dto,
      items,
      totalCost,
      tax,
      addedBy: req.user.userId,
      supplierId: req.user.supplierId,
      restaurantId: goodsReceipts[0].restaurantId,
    });

    return invoiceReceipt;
  }

  async findAll(
    req: any,
    query: QueryInvoiceReceiptDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<InvoiceReceiptDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.invoiceReceiptModelPag.paginate(
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
    invoiceReceiptId: string,
    i18n: I18nContext,
  ): Promise<InvoiceReceiptDocument> {
    const exists = await this.invoiceReceiptModel.findById(invoiceReceiptId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    invoiceReceiptId: string,
    dto: UpdateInvoiceReceiptDto,
    i18n: I18nContext,
  ): Promise<InvoiceReceiptDocument> {
    const goodsReceipts = await this.validate(dto, i18n);
    const items: any = dto.items;
    let totalCost = 0;
    items.forEach((i) => {
      const itemTaxableAmount = roundOffNumber(i.cost / (1 + Tax.rate / 100));
      i.tax = (itemTaxableAmount * Tax.rate) / 100;
      i.stockValue = i.stock * i.cost;
      totalCost += i.stockValue;
    });
    const totalTaxableAmount = roundOffNumber(totalCost / (1 + Tax.rate / 100));
    const tax = (totalTaxableAmount * Tax.rate) / 100;
    const invoiceReceipt = await this.invoiceReceiptModel.findByIdAndUpdate(
      invoiceReceiptId,
      { ...dto, totalCost, tax },
      {
        new: true,
      },
    );

    if (!invoiceReceipt) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return invoiceReceipt;
  }

  async remove(invoiceReceiptId: string, i18n: I18nContext): Promise<boolean> {
    const invoiceReceipt = await this.invoiceReceiptModel.findByIdAndDelete(
      invoiceReceiptId,
    );

    if (!invoiceReceipt) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }

  async validate(dto: CreateInvoiceReceiptDto | UpdateInvoiceReceiptDto, i18n) {
    const goodsReceipts = await this.goodsReceiptModel.find({
      purchaseOrderId: dto.purchaseOrderId,
    });
    const loadedItems = [];

    goodsReceipts.forEach((goodsReceipt) => {
      goodsReceipt.items.forEach((item) => {
        if (loadedItems[item.materialId.toString()]) {
          loadedItems[item.materialId.toString()] += item.stock;
        } else {
          loadedItems[item.materialId.toString()] = item.stock;
        }
      });
    });
    for (const i in dto.items) {
      if (!loadedItems[dto.items[i].materialId]) {
        throw new BadRequestException(
          `${dto.items[i].materialId} ${i18n.t('NOT_ALLOWED')}`,
        );
      }

      if (dto.items[i].stock > loadedItems[dto.items[i].materialId]) {
        throw new BadRequestException(
          `Max ${loadedItems[dto.items[i].materialId]} quantities allowed for ${
            dto.items[i].materialId
          }`,
        );
      }
    }
    return goodsReceipts;
  }
}
