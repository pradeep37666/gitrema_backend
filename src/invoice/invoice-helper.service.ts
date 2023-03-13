import { Invoice } from '@axenda/zatca';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import Handlebars from 'handlebars';

import * as moment from 'moment';
import * as MomentHandler from 'handlebars.moment';
import { FatooraService } from './fatoora.service';
import { S3Service } from 'src/core/Providers/Storage/S3.service';
import { LeanDocument, Model, PaginateModel } from 'mongoose';
import { InvoiceDocument } from './schemas/invoice.schema';
import { InvoiceType } from './invoice.enum';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { InvoiceStatus } from 'src/order/enum/en.enum';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import * as uniqid from 'uniqid';
import { CalculationService } from 'src/order/calculation.service';

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
export class InvoiceHelperService {
  constructor(
    private readonly fatooraService: FatooraService,
    private readonly s3Service: S3Service,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,

    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly calculationService: CalculationService,
  ) {}

  async generateInvoice(
    order: LeanDocument<OrderDocument>,
    dto: CreateInvoiceDto,
    cancelledInvoice: InvoiceDocument = null,
  ): Promise<{ url: string; items: any[] }> {
    const multiplier = cancelledInvoice ? -1 : 1;
    console.log(order.supplierId, {
      sellerName: order.supplierId.nameAr ?? order.supplierId.name,
      vatRegistrationNumber: '311151351200003',
      invoiceTimestamp: moment().format(),
      invoiceTotal: (multiplier * order.summary.totalWithTax).toString(),
      invoiceVatTotal: (multiplier * order.summary.totalTax).toString(),
    });
    // generate QR code base64 image
    const qrCode = await this.fatooraService.generateInvoiceQrImage({
      sellerName: order.supplierId.nameAr ?? order.supplierId.name,
      vatRegistrationNumber: '311151351200003',
      invoiceTimestamp: moment().format(),
      invoiceTotal: (multiplier * order.summary.totalWithTax).toString(),
      invoiceVatTotal: (multiplier * order.summary.totalTax).toString(),
    });

    const templateHtml = fs.readFileSync(
      'src/invoice/templates/invoice.html',
      'utf8',
    );

    const template = Handlebars.compile(templateHtml);
    const html = template({
      qrCode,
      invoiceNumber: dto.invoiceNumber,
      order: order,
      multiplier,
    });

    const items = [];
    order.items.forEach((oi) => {
      items.push({ itemId: oi._id, quantity: oi.quantity });
    });
    const s3Url = await this.uploadDocument(
      html,
      order.supplierId._id + '/' + order.restaurantId._id + '/invoice/',
    );

    if (s3Url) return { url: s3Url.Location, items };
    throw new BadRequestException(`Error generating invoice`);
  }

  async generateCreditMemo(
    order: LeanDocument<OrderDocument>,
    dto: CreateInvoiceDto,
    refInvoice: InvoiceDocument,
    cancelledInvoice: InvoiceDocument = null,
  ): Promise<{ url: string; items: any[] }> {
    const multiplier = cancelledInvoice ? -1 : 1;

    const summary = this.prepareCreditMemoItems(dto, order);
    console.log(summary);
    // generate QR code base64 image
    const qrCode = await this.fatooraService.generateInvoiceQrImage({
      sellerName: order.supplierId.nameAr ?? order.supplierId.name,
      vatRegistrationNumber: '311151351200003',
      invoiceTimestamp: moment().format(),
      invoiceTotal: (multiplier * summary.totalWithTax).toString(),
      invoiceVatTotal: (multiplier * summary.tax).toString(),
    });

    const templateHtml = fs.readFileSync(
      'src/invoice/templates/credit.html',
      'utf8',
    );

    const template = Handlebars.compile(templateHtml);
    const html = template({
      qrCode,
      invoiceNumber: dto.invoiceNumber,
      order,
      summary,
      multiplier,
      refInvoiceNumber: refInvoice.invoiceNumber,
    });

    const s3Url = await this.uploadDocument(
      html,
      order.supplierId._id + '/' + order.restaurantId._id + '/invoice/',
    );
    if (s3Url) return { url: s3Url.Location, items: summary.items };
    throw new BadRequestException(`Error generating invoice`);
  }

  prepareCreditMemoItems(
    dto: CreateInvoiceDto,
    order: LeanDocument<OrderDocument>,
  ) {
    const summary = {
      taxableAmount: 0,
      tax: 0,
      totalWithTax: 0,
      items: [],
    };

    for (const i in dto.items) {
      if (dto.items[i].itemId) {
        const itemObj = order.items.find((itemObj) => {
          return itemObj._id.toString() == dto.items[i].itemId;
        });
        if (!itemObj) {
          throw new BadRequestException(
            `${dto.items[i].itemId} is not found within ${order._id}`,
          );
        }
        const itemSummary = this.calculationService.calculateTax(
          itemObj.unitPriceAfterDiscount,
          dto.items[i].quantity ?? itemObj.quantity,
          order.taxRate,
        );

        summary.taxableAmount += itemSummary.taxableAmount;
        summary.tax += itemSummary.tax;
        summary.totalWithTax += itemSummary.totalWithTax;

        summary.items.push({
          ...dto.items[i],
          ...itemSummary,
          quantity: dto.items[i].quantity ?? itemObj.quantity,
          unitPrice: itemObj.unitPriceAfterDiscount,
          description: dto.items[i].description ?? itemObj.menuItem.nameAr,
        });
      } else {
        const itemSummary = this.calculationService.calculateTax(
          dto.items[i].totalWithTax,
          dto.items[i].quantity > 0 ? dto.items[i].quantity : 1,
          order.taxRate,
        );

        summary.taxableAmount += itemSummary.taxableAmount;
        summary.tax += itemSummary.tax;
        summary.totalWithTax += itemSummary.totalWithTax;

        summary.items.push({
          ...dto.items[i],
          ...itemSummary,
          quantity: dto.items[i].quantity ?? 0,
          unitPrice: 0,
          description: dto.items[i].description,
        });
      }
    }
    return summary;
  }

  async uploadDocument(html: string, directory: string) {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disk-cache-dir=/tmp/',
        '--disable-gpu',
      ],
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfPath =
      './upload/' + (await uniqid.process().toUpperCase()) + '.pdf';
    await page.pdf({
      format: 'A4',
      path: pdfPath,
    });
    browser.close();
    const s3Url: any = await this.s3Service.uploadLocalFile(pdfPath, directory);
    return s3Url;
  }

  async generateInvoiceNumber(supplierId: string): Promise<string> {
    const invoice = await this.invoiceModel.findOne(
      { supplierId, type: { $ne: InvoiceType.Receipt } },
      {},
      { sort: { _id: -1 } },
    );
    const n = parseInt(invoice ? invoice.invoiceNumber : '0') + 1;
    return String(n).padStart(7, '0');
  }

  async postInvoiceCreate(
    invoice: InvoiceDocument,
    order: LeanDocument<OrderDocument>,
  ) {
    if (invoice.type == InvoiceType.Invoice) {
      await this.orderModel.findByIdAndUpdate(invoice.orderId, {
        invoiceStatus: InvoiceStatus.Invoiced,
      });
    }
  }
}
