import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { Offer, OfferDocument } from 'src/offer/schemas/offer.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import * as moment from 'moment';
import { CalculationType } from 'src/core/Constants/enum';

@Injectable()
export class CalculationService {
  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
  ) {}

  async calculateSummery(orderData, supplier: LeanDocument<SupplierDocument>) {
    const summary = {
      totalBeforeDiscount: 0,
      discount: 0,
      totalWithTax: 0,
      totalTaxableAmount: 0,
      totalTax: 0,
    };

    summary.totalBeforeDiscount += orderData.items.reduce(
      (acc, oi) => acc + oi.amountBeforeDiscount,
      0,
    );

    summary.discount += orderData.items.reduce(
      (acc, oi) => acc + oi.discount,
      0,
    );

    summary.totalWithTax += orderData.items.reduce(
      (acc, oi) => acc + oi.amountAfterDiscount,
      0,
    );

    summary.totalTaxableAmount += orderData.items.reduce(
      (acc, oi) => acc + oi.itemTaxableAmount,
      0,
    );

    summary.totalTax += orderData.items.reduce((acc, oi) => acc + oi.tax, 0);

    //apply table fee in tax
    summary.totalBeforeDiscount += orderData.tableFee.fee;
    summary.totalTax += orderData.tableFee.tax;
    summary.totalWithTax += orderData.tableFee.fee;
    summary.totalTaxableAmount += orderData.tableFee.netBeforeTax;

    return summary;
  }
}
