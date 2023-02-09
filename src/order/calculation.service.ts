import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { Offer, OfferDocument } from 'src/offer/schemas/offer.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import * as moment from 'moment';
import { CalculationType } from 'src/core/Constants/enum';
import { ApplicationType } from 'src/offer/enum/en.enum';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';

@Injectable()
export class CalculationService {
  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
  ) {}

  async calculateSummery(orderData) {
    const summary = {
      totalBeforeDiscount: 0,
      discount: 0,
      totalWithTax: 0,
      totalTaxableAmount: 0,
      totalTax: 0,
      totalPaid: 0,
      totalRefunded: 0,
      headerDiscount: 0,
    };

    let offer = await this.offerModel.findOne(
      {
        active: true,
        deletedAt: null,
        start: {
          $lte: new Date(moment.utc().format('YYYY-MM-DD')),
        },
        end: {
          $gte: new Date(moment.utc().format('YYYY-MM-DD')),
        },
        applicationType: ApplicationType.Header,
        code: null,
      },
      {},
      { sort: { priority: 1 } },
    );
    if (!offer && orderData.couponCode) {
      offer = await this.offerModel.findOne(
        {
          active: true,
          deletedAt: null,
          start: {
            $lte: new Date(moment.utc().format('YYYY-MM-DD')),
          },
          end: {
            $gte: new Date(moment.utc().format('YYYY-MM-DD')),
          },
          code: orderData.couponCode,
          applicationType: ApplicationType.Header,
        },
        {},
        { sort: { priority: 1 } },
      );
      if (offer && offer.maxNumberAllowed > offer.totalUsed) offer = null;
    }

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

    // summary.totalTaxableAmount += orderData.items.reduce(
    //   (acc, oi) => acc + oi.itemTaxableAmount,
    //   0,
    // );

    // summary.totalTax += orderData.items.reduce((acc, oi) => acc + oi.tax, 0);

    //apply table fee in tax
    summary.totalBeforeDiscount += orderData.tableFee.fee;
    summary.totalWithTax += orderData.tableFee.fee;

    // apply header discount
    if (offer) {
      summary.headerDiscount =
        offer.discountType == CalculationType.Fixed
          ? offer.discount
          : roundOffNumber((summary.totalWithTax * offer.discount) / 100);
      summary.headerDiscount = offer.maxDiscount
        ? summary.headerDiscount > offer.maxDiscount
          ? offer.maxDiscount
          : summary.headerDiscount
        : summary.headerDiscount;

      summary.discount += summary.headerDiscount;

      summary.totalWithTax -= summary.headerDiscount;
    }

    summary.totalTaxableAmount =
      summary.totalWithTax / (1 + orderData.taxRate / 100);

    summary.totalTax = (summary.totalTaxableAmount * orderData.taxRate) / 100;

    summary.totalBeforeDiscount = roundOffNumber(summary.totalBeforeDiscount);
    summary.discount = roundOffNumber(summary.discount);
    summary.totalWithTax = roundOffNumber(summary.totalWithTax);
    summary.totalTaxableAmount = roundOffNumber(summary.totalTaxableAmount);
    summary.totalTax = roundOffNumber(summary.totalTax);

    return summary;
  }
}
