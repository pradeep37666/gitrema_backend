import { Invoice } from '@axenda/zatca';
import { Injectable } from '@nestjs/common';
import { FatooraInvoiceDto } from './dto/fatoora-invoice.dto';

@Injectable()
export class FatooraService {
  //constructor() {}

  async generateInvoiceQrImage(
    fatooraInvoiceDetails: FatooraInvoiceDto,
  ): Promise<string> {
    const invoice = new Invoice(fatooraInvoiceDetails);

    invoice.toTlv();

    invoice.toBase64();

    return await invoice.render();
  }
}
