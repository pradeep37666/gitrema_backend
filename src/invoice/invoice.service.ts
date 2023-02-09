import { Invoice } from '@axenda/zatca';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import Handlebars from 'handlebars';

import * as MomentHandler from 'handlebars.moment';
import { FatooraService } from './fatoora.service';
import { S3Service } from 'src/core/Providers/Storage/S3.service';
import { Model, PaginateModel } from 'mongoose';
import { InvoiceDocument } from './schemas/invoice.schema';
import { InvoiceType } from './invoice.enum';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { PaymentStatus } from 'src/order/enum/en.enum';
import { InvoiceHelperService } from './invoice-helper.service';

MomentHandler.registerHelpers(Handlebars);
Handlebars.registerHelper('math', function (lvalue, operator, rvalue, options) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    '+': lvalue + rvalue,
    '-': lvalue - rvalue,
    '*': lvalue * rvalue,
    '/': lvalue / rvalue,
    '%': lvalue % rvalue,
  }[operator];
});

@Injectable()
export class InvoiceService {
  constructor(
    private readonly invoiceHelperService: InvoiceHelperService,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Invoice.name)
    private invoiceModelPag: PaginateModel<InvoiceDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async checkIfInvoiceExist(orderId: string): Promise<number> {
    const invoice = await this.invoiceModel.count({
      orderId,
      type: InvoiceType.Invoice,
      isReversedInvoice: false,
      reversedInvoiceId: null,
    });
    return invoice;
  }

  async create(
    req,
    dto: CreateInvoiceDto,
    cancelledInvoice: InvoiceDocument = null,
  ): Promise<InvoiceDocument> {
    const order = await this.orderModel
      .findById(dto.orderId)
      .populate([
        {
          path: 'supplierId',
        },
        {
          path: 'restaurantId',
        },
      ])
      .lean();

    // check if invoice already exist
    if (
      !cancelledInvoice &&
      dto.type == InvoiceType.Invoice &&
      (await this.checkIfInvoiceExist(dto.orderId)) > 0
    ) {
      throw new BadRequestException(`Invoice already exists`);
    }
    dto.invoiceNumber = await this.invoiceHelperService.generateInvoiceNumber(
      order.supplierId._id,
    );
    // generate invoice
    const { url } = await this.invoiceHelperService.generateInvoice(
      order,
      dto,
      cancelledInvoice,
    );

    // create invoice record
    const invoice = await this.invoiceModel.create({
      ...dto,
      addedBy: req.user.userId,
      supplierId: order.supplierId,
      restaurantId: order.restaurantId,
      url,
    });

    return invoice;
  }

  async cancel(req, invoiceId: string) {
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
      reversedInvoiceId: null,
    });
    // check if already cancelled
    if (!invoice) {
      throw new BadRequestException(`Already cancelled`);
    }
    // check if its main invoice and any credit / debit memo is already created
    if (invoice.type == InvoiceType.Invoice) {
      const relatedInvoice = await this.invoiceModel.count({
        refInvoiceId: invoice._id,
      });
      if (relatedInvoice > 0) {
        throw new BadRequestException(`Please cancel the credit memo first`);
      }
    }
    // generate reversed invoice
    const reversedInvoice = await this.create(
      req,
      {
        orderId: invoice.orderId.toString(),
        type: invoice.type,
      },
      invoice,
    );

    invoice.reversedInvoiceId = reversedInvoice._id;
    invoice.save();
    return reversedInvoice;
  }
}
