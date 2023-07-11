import { Invoice } from '@axenda/zatca';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
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
import { Order, OrderDocument, Receipts } from 'src/order/schemas/order.schema';
import { InvoiceStatus, OrderPaymentStatus } from 'src/order/enum/en.enum';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import * as uniqid from 'uniqid';
import { CalculationService } from 'src/order/calculation.service';
import * as EscPosEncoder from 'esc-pos-encoder-latest';
import { Image } from 'canvas';
import * as CodepageEncoder from 'codepage-encoder';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import { SocketEvents } from 'src/socket-io/enum/events.enum';
import { Printer, PrinterDocument } from 'src/printer/schema/printer.schema';
import { InvoiceService } from './invoice.service';
import {
  convertUtcToSupplierTimezone,
  roundOffNumber,
} from 'src/core/Helpers/universal.helper';
import { PrinterType } from 'src/printer/enum/en';
import { OrderType } from 'src/order/enum/en.enum';

import { OrderType as ArOrderType } from 'src/order/enum/ar.enum';
import { TIMEZONE } from 'src/core/Constants/system.constant';

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
Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

@Injectable()
export class InvoiceHelperService {
  constructor(
    private readonly fatooraService: FatooraService,
    private readonly s3Service: S3Service,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,

    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject(forwardRef(() => CalculationService))
    private readonly calculationService: CalculationService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => InvoiceService))
    private readonly invoiceService: InvoiceService,
    private readonly socketGateway: SocketIoGateway,
    @InjectModel(Printer.name) private printerModel: Model<PrinterDocument>,
  ) {}

  async generateInvoice(
    order: LeanDocument<OrderDocument>,
    dto: CreateInvoiceDto,
    cancelledInvoice: InvoiceDocument = null,
  ): Promise<{ url: string; items: any[]; html: string; imageUrl: string }> {
    const multiplier = cancelledInvoice ? -1 : 1;
    const orderObj: any = order;
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

    orderObj.items.forEach((oi) => {
      let message = '';
      oi.additions.forEach((oia) => {
        const options = oia.options.map((o) => {
          return o.nameAr;
        });
        message += `- ${options.join(',')}`;
        message += `\n`;
      });
      oi.additionTextAr = message;
    });
    let items = dto.items;
    if (!items) {
      items = [];
      orderObj.items.forEach((oi) => {
        let message = '';
        oi.additions.forEach((oia) => {
          const options = oia.options.map((o) => {
            return o.nameAr;
          });
          message += `- ${options.join(',')}`;
          message += `\n`;
        });

        items.push({
          name: oi.menuItem.name,
          nameAr: oi.menuItem.nameAr,
          quantity: oi.quantity,
          additionTextAr: message,
          totalWithTax: roundOffNumber(oi.amountAfterDiscount, 2),
          itemId: oi._id,
          taxableAmount: roundOffNumber(oi.itemTaxableAmount, 2),
          tax: roundOffNumber(oi.tax, 2),
        });
      });
    }

    const orderData = {
      totalTaxableAmount: 0,
      totalWithTax: 0,
      totalTax: 0,
    };

    items.forEach((i) => {
      orderData.totalTaxableAmount += i.taxableAmount;
      orderData.totalWithTax += i.totalWithTax;
      orderData.totalTax += i.tax;
    });
    orderData.totalTax = roundOffNumber(orderData.totalTax, 2);
    orderData.totalWithTax = roundOffNumber(orderData.totalWithTax, 2);
    orderData.totalTaxableAmount = roundOffNumber(
      orderData.totalTaxableAmount,
      2,
    );
    const discounts = [];
    if (order.summary.headerDiscount) {
      discounts.push({ amount: order.summary.headerDiscount * -1 });
    }
    order.createdAt = convertUtcToSupplierTimezone(
      order.createdAt,
      order.supplierId?.timezone ?? TIMEZONE,
    );
    const templateHtml = fs.readFileSync(
      'src/invoice/templates/invoice.v1.html',
      'utf8',
    );

    const template = Handlebars.compile(templateHtml);
    const html = template({
      qrCode,
      invoiceNumber: dto.invoiceNumber,
      order: orderObj,
      items,
      orderData,
      isFeeApplied: order.feeRate ? 'TRUE' : 'FALSE',
      isTableExist: order.tableId ? 'TRUE' : 'FALSE',
      discounts,
      multiplier,
    });

    const document = await this.uploadDocument(
      html,
      order.supplierId._id + '/' + order.restaurantId._id + '/invoice/',
    );

    if (document.s3Url && document.imageUrl)
      return {
        url: document.s3Url.Location,
        items,
        html,
        imageUrl: document.imageUrl.Location,
      };
    throw new BadRequestException(VALIDATION_MESSAGES.InvoiceError.key);
  }

  async generateKitchenReceipt(
    order: OrderDocument,
    printerDetails: { printers: string[]; printerItems: string[] },
    print = true,
  ): Promise<Receipts[]> {
    await order.populate([
      { path: 'restaurantId' },
      { path: 'tableId' },
      { path: 'waiterId' },
    ]);

    const orderObj: any = order.toObject();

    orderObj.items.forEach((oi) => {
      let message = '';
      oi.additions.forEach((oia) => {
        const options = oia.options.map((o) => {
          return o.nameAr;
        });
        message += `- ${options.join(',')}`;
        message += '\n';
      });
      oi.additionTextAr = message;
    });

    const templateHtml = fs.readFileSync(
      'src/invoice/templates/kitchen-receipt.v2.html',
      'utf8',
    );

    const response = [];
    for (const i in printerDetails.printers) {
      const tempOrderObj = { ...orderObj };
      //console.log(orderObj.items);
      tempOrderObj.items = orderObj.items.filter((oi) => {
        return printerDetails.printerItems[printerDetails.printers[i]].includes(
          oi.menuItem.menuItemId.toString(),
        );
      });
      // console.log(
      //   printerDetails.printers[i],
      //   printerDetails.printerItems[printerDetails.printers[i]],
      //   tempOrderObj.items,
      // );
      const printer = await this.printerModel
        .findById(printerDetails.printers[i])
        .lean();

      tempOrderObj.createdAt = convertUtcToSupplierTimezone(
        tempOrderObj.createdAt,
        tempOrderObj.supplierId?.timezone ?? TIMEZONE,
      );

      const template = Handlebars.compile(templateHtml);

      const html = template({
        order: tempOrderObj,
        printer,
        orderType:
          ArOrderType[
            Object.keys(OrderType)[
              Object.values(OrderType).indexOf(order.orderType)
            ]
          ],
      });

      const imageUrl = await this.uploadDocument(
        html,
        order.supplierId._id +
          '/' +
          order.restaurantId._id +
          '/kitchen-receipt/',
        true,
      );
      response.push({
        printerId: printerDetails.printers[i],
        url: imageUrl,
      });
      if (print)
        this.printKitchenReceipts(order.supplierId.toString(), {
          printer: printer,
          url: imageUrl,
        });
    }

    return response;
  }

  async generateCreditMemo(
    order: LeanDocument<OrderDocument>,
    dto: CreateInvoiceDto,
    refInvoice: InvoiceDocument,
    cancelledInvoice: InvoiceDocument = null,
  ): Promise<{ url: string; items: any[]; html: string; imageUrl: string }> {
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

    const document = await this.uploadDocument(
      html,
      order.supplierId._id + '/' + order.restaurantId._id + '/invoice/',
    );
    if (document.s3Url && document.imageUrl)
      return {
        url: document.s3Url.Location,
        items: summary.items,
        html,
        imageUrl: document.imageUrl.Location,
      };
    throw new BadRequestException(VALIDATION_MESSAGES.InvoiceError.key);
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

  async uploadDocument(html: string, directory: string, onlyImage = false) {
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

    //await page.goto(`data:text/html,${html}`, { waitUntil: 'networkidle0' });
    await page.setContent(html, { waitUntil: 'load' });
    const [x, y, width, height] = await page.evaluate(() => {
      const element = document.getElementById('container');
      const { x, y, width, height } = element.getBoundingClientRect();
      return [x, y, width, height];
      // return [
      //   document.getElementById('container').offsetHeight,
      //   document.getElementById('container').offsetWidth,
      // ];
    });

    const imagePath =
      './upload/' + (await uniqid.process().toUpperCase()) + '.png';

    await page.screenshot({
      path: imagePath,
      clip: { x, y, width, height },
    });
    const imageUrl: any = await this.s3Service.uploadLocalFile(
      imagePath,
      directory,
    );
    if (onlyImage) {
      browser.close();
      return imageUrl.Location;
    }
    const pdfPath =
      './upload/' + (await uniqid.process().toUpperCase()) + '.pdf';
    await page.pdf({
      format: 'A4',
      path: pdfPath,
    });
    browser.close();
    const s3Url: any = await this.s3Service.uploadLocalFile(pdfPath, directory);

    return { s3Url, imageUrl };
  }

  async generateInvoiceNumber(supplierId: string): Promise<string> {
    const invoice = await this.invoiceModel.findOne(
      { supplierId, type: { $ne: InvoiceType.Receipt } },
      {},
      { sort: { _id: -1 } },
    );
    const n = parseInt(invoice ? invoice.invoiceNumber : '0') + 1;
    //return String(n).padStart(7, '0');
    return n.toString();
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

    const printer = await this.printerModel.findOne({
      isDefault: true,
      type: PrinterType.Cashier,
      supplierId: invoice.supplierId,
    });
    await this.socketGateway.emit(
      invoice.supplierId.toString(),
      SocketEvents.print,
      {
        printer: printer.toObject(),
        url: invoice.imageUrl,
      },
    );

    await this.socketGateway.emit(
      invoice.supplierId.toString(),
      SocketEvents.Invoice,
      invoice.toObject(),
    );
  }

  async printKitchenReceipts(supplierId: string, kitchenReceipt: any) {
    await this.socketGateway.emit(supplierId, SocketEvents.print, {
      printer: kitchenReceipt.printer,
      url: kitchenReceipt.url,
    });
  }

  async generateEscCommandsForInvoice(imageUrl: string) {
    const imageResponse = await lastValueFrom(
      this.httpService
        .get(imageUrl, {
          responseType: 'arraybuffer',
        })
        .pipe(
          catchError((e) => {
            throw new BadRequestException(e);
          }),
        ),
    );

    console.log(imageResponse);
    if (imageResponse.status != HttpStatus.OK)
      throw new BadRequestException(VALIDATION_MESSAGES.InvoicePrintError.key);
    const raw = Buffer.from(imageResponse.data).toString('base64');

    const img = new Image();
    img.src =
      'data:' + imageResponse.headers['content-type'] + ';base64,' + raw;
    const width = 592;
    const scaledHeight = img.height * (592 / img.width);
    const height = Number.isInteger(scaledHeight / 8)
      ? scaledHeight
      : 8 * Math.ceil(scaledHeight / 8);

    const escEncoder = new EscPosEncoder({
      imageMode: 'raster',
    });
    const commands = escEncoder
      .initialize()
      .align('left')
      .image(img, width, height, 'threshold', 200)
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut()
      .encode();
    console.log(commands);
    return commands;
  }

  async regenerateInvoice(order: OrderDocument, onlyCancel = false) {
    const invoice = await this.invoiceModel.findOne({
      orderId: order._id,
      type: InvoiceType.Invoice,
      isReversedInvoice: false,
      reversedInvoiceId: null,
    });
    if (invoice) {
      await this.invoiceService.cancel(null, invoice._id.toString());
      if (onlyCancel == false) {
        await this.invoiceService.create(null, {
          orderId: order._id,
          type: InvoiceType.Invoice,
        });
      }
    }
  }
}
