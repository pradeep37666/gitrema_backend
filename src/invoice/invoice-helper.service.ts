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
import { InvoiceStatus, PaymentStatus } from 'src/order/enum/en.enum';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import * as uniqid from 'uniqid';

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
  ) {}

  async generateInvoice(
    order: LeanDocument<OrderDocument>,
    dto: CreateInvoiceDto,
    cancelledInvoice: InvoiceDocument = null,
  ): Promise<{ url: string }> {
    const multiplier = cancelledInvoice ? -1 : 1;
    // generate QR code base64 image
    const qrCode = await this.fatooraService.generateInvoiceQrImage({
      sellerName: order.supplierId.nameAr,
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

    const s3Url = await this.uploadDocument(
      html,
      order.supplierId._id + '/' + order.restaurantId._id + '/invoice/',
    );
    if (s3Url) return { url: s3Url.Location };
    throw new BadRequestException(`Error generating invoice`);
  }

  async generateCreditMemo(
    order: LeanDocument<OrderDocument>,
    dto: CreateInvoiceDto,
    cancelledInvoice: InvoiceDocument = null,
  ): Promise<{ url: string }> {
    const multiplier = cancelledInvoice ? -1 : 1;

    // generate QR code base64 image
    const qrCode = await this.fatooraService.generateInvoiceQrImage({
      sellerName: order.supplierId.nameAr,
      vatRegistrationNumber: '311151351200003',
      invoiceTimestamp: moment().format(),
      invoiceTotal: (multiplier * order.summary.totalWithTax).toString(),
      invoiceVatTotal: (multiplier * order.summary.totalTax).toString(),
    });

    const templateHtml = fs.readFileSync(
      'src/invoice/templates/credit.html',
      'utf8',
    );

    const template = Handlebars.compile(templateHtml);
    const html = template({
      qrCode,
      invoiceNumber: dto.invoiceNumber,
      order: order,
      multiplier,
    });

    const s3Url = await this.uploadDocument(
      html,
      order.supplierId._id + '/' + order.restaurantId._id + '/invoice/',
    );
    if (s3Url) return { url: s3Url.Location };
    throw new BadRequestException(`Error generating invoice`);
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
    const n = parseInt(invoice.invoiceNumber) + 1;
    return String(n).padStart(6, '0');
  }

  async postInvoiceCreate(invoice: InvoiceDocument) {
    if (invoice.type == InvoiceType.Invoice) {
      await this.orderModel.findByIdAndUpdate(invoice.orderId, {
        invoiceStatus: InvoiceStatus.Invoiced,
      });
    }
  }
}
