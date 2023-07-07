import { Invoice } from '@axenda/zatca';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import Handlebars from 'handlebars';

import * as MomentHandler from 'handlebars.moment';
import { FatooraService } from './fatoora.service';
import { S3Service } from 'src/core/Providers/Storage/S3.service';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { InvoiceDocument } from './schemas/invoice.schema';
import { InvoiceType } from './invoice.enum';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { OrderPaymentStatus } from 'src/order/enum/en.enum';
import { InvoiceHelperService } from './invoice-helper.service';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

import { EscCommandsDto } from './dto/esc-commands.dto';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import { PrintInvoiceDto } from './dto/print-invoice.dto';
import { Printer, PrinterDocument } from 'src/printer/schema/printer.schema';
import { Cashier } from 'src/cashier/schemas/cashier.schema';
import { PrinterType } from 'src/printer/enum/en';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import { SocketEvents } from 'src/socket-io/enum/events.enum';

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
    @InjectModel(Printer.name) private printerModel: Model<PrinterDocument>,
    private readonly socketGateway: SocketIoGateway,
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
      throw new BadRequestException(VALIDATION_MESSAGES.InvoiceExists.key);
    }
    dto.invoiceNumber = cancelledInvoice
      ? cancelledInvoice.invoiceNumber
      : await this.invoiceHelperService.generateInvoiceNumber(
          order.supplierId._id,
        );
    let invoiceData = { url: '', items: null, html: '', imageUrl: '' },
      refInvoice = null;
    // generate invoice
    if (dto.type == InvoiceType.Invoice)
      invoiceData = await this.invoiceHelperService.generateInvoice(
        order,
        dto,
        cancelledInvoice,
      );
    else if (dto.type == InvoiceType.CreditMemo) {
      refInvoice = await this.invoiceModel.findOne({
        orderId: order._id,
        type: InvoiceType.Invoice,
      });
      if (!refInvoice) {
        throw new BadRequestException(
          VALIDATION_MESSAGES.RefInvoiceNotFound.key,
        );
      }
      invoiceData = await this.invoiceHelperService.generateCreditMemo(
        order,
        dto,
        refInvoice,
        cancelledInvoice,
      );
    }
    console.log(invoiceData);
    // create invoice record
    const invoice = await this.invoiceModel.create({
      ...dto,
      orderNumber: order.orderNumber,
      addedBy: req?.user?.userId ?? null,
      supplierId: order.supplierId._id,
      restaurantId: order.restaurantId._id,
      url: invoiceData.url,
      imageUrl: invoiceData.imageUrl,
      items: invoiceData.items,
      refInvoiceId: refInvoice ? refInvoice._id : null,
      isReversedInvoice: cancelledInvoice ? true : false,
      refOriginalInvoiceId: cancelledInvoice ? cancelledInvoice._id : null,
    });

    this.invoiceHelperService.postInvoiceCreate(invoice, order);

    return invoice;
  }

  async cancel(req, invoiceId: string) {
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
      reversedInvoiceId: null,
    });

    // check if already cancelled
    if (!invoice) {
      throw new BadRequestException(VALIDATION_MESSAGES.AlreadyCancelled.key);
    }
    const invoiceData = invoice.toObject();
    // check if its main invoice and any credit / debit memo is already created
    if (invoice.type == InvoiceType.Invoice) {
      const relatedInvoice = await this.invoiceModel.count({
        refInvoiceId: invoice._id,
      });
      if (relatedInvoice > 0) {
        throw new BadRequestException(VALIDATION_MESSAGES.CancelCreditMemo.key);
      }
    }
    // generate reversed invoice
    const reversedInvoice = await this.create(
      req,
      {
        orderId: invoice.orderId.toString(),
        type: invoice.type,
        items: invoiceData.items,
      },
      invoice,
    );

    invoice.reversedInvoiceId = reversedInvoice._id;
    invoice.save();
    return reversedInvoice;
  }

  async all(
    req: any,
    queryInvoice: QueryInvoiceDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<InvoiceDocument>> {
    const criteria: any = {
      ...queryInvoice,
    };

    const invoices = await this.invoiceModelPag.paginate(criteria, {
      sort: DefaultSort,
      lean: true,
      ...paginateOptions,
      ...pagination,
    });
    return invoices;
  }

  async generateCommands(req, query: EscCommandsDto) {
    let commands = null;

    if (query.type == InvoiceType.Invoice) {
      const invoice = await this.invoiceModel.findOne({
        orderId: query.orderId,
      });
      if (!invoice) {
        throw new BadRequestException(VALIDATION_MESSAGES.InvoiceNotFound.key);
      }
      commands = await this.invoiceHelperService.generateEscCommandsForInvoice(
        invoice.imageUrl,
      );
      commands = Object.values(commands);
    } else if (query.type == InvoiceType.KitchenReceipt) {
      const order = await this.orderModel.findById(query.orderId);
      const kitchenReceipt = order.kitchenReceipts.find((r) => {
        return r.printerId.toString() == query.printerId;
      });
      if (!kitchenReceipt) {
        throw new BadRequestException(VALIDATION_MESSAGES.InvoiceNotFound.key);
      }
      commands = await this.invoiceHelperService.generateEscCommandsForInvoice(
        kitchenReceipt.url,
      );
    }
    return commands;
  }
  async printInvoice(req, query: PrintInvoiceDto) {
    let response = [];
    if (!query.type || query.type == PrinterType.Cashier) {
      const printer = await this.printerModel.findOne({
        isDefault: true,
        type: PrinterType.Cashier,
        supplierId: req.user.supplierId,
      });
      if (!printer && query.type) {
        throw new BadRequestException(`No Cashier Printer Found`);
      }
      const invoice = await this.invoiceModel.findOne({
        orderId: query.orderId,
      });
      if (!invoice && query.type) {
        throw new BadRequestException(VALIDATION_MESSAGES.InvoiceNotFound.key);
      }
      // let commands =
      //   await this.invoiceHelperService.generateEscCommandsForInvoice(
      //     invoice.imageUrl,
      //   );
      // commands = Object.values(commands);
      // await this.socketGateway.emit(
      //   invoice.supplierId.toString(),
      //   SocketEvents.print,
      //   {
      //     place: printer._id.toString(),
      //     commands,
      //   },
      //   `${invoice.supplierId.toString()}_PRINT`,
      // );
      response.push({
        printer,
        url: invoice.imageUrl,
      });
    }
    if (!query.type || query.type == PrinterType.Kitchen) {
      const order = await this.orderModel.findById(query.orderId).populate([
        {
          path: 'kitchenReceipts.printerId',
        },
      ]);
      for (const i in order.kitchenReceipts) {
        response.push({
          printer: order.kitchenReceipts[i].printerId,
          url: order.kitchenReceipts[i].url,
        });
      }
    }
    return response;
  }
}
