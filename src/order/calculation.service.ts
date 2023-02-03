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
      net: 0,
      tax: 0,
      gross: 0,
      itemTotal: 0,
      total: 0,
      discount: 0,

      tableFeeWithoutTax: 0,
      tableFee: 0,
    };

    if (orderData.tableFee) {
      summary.tableFee = orderData.tableFee;

      const taxRate = supplier.taxRate ?? 15;
      summary.tableFeeWithoutTax = supplier.taxEnabledOnTableFee
        ? roundOffNumber(orderData.tableFee / (1 + taxRate / 100))
        : orderData.tableFee;
    }
    summary.gross += orderData.items.reduce(
      (acc, oi) => acc + oi.gross * oi.quantity,
      0,
    );
    summary.itemTotal += orderData.items.reduce(
      (acc, oi) => acc + oi.itemTotal,
      0,
    );

    summary.discount += orderData.items.reduce(
      (acc, oi) => acc + oi.discount,
      0,
    );

    summary.tax += orderData.items.reduce((acc, oi) => acc + oi.tax, 0);

    // to show net without tax in summary
    summary.net = summary.itemTotal - summary.tax;

    summary.tax += summary.tableFee - summary.tableFeeWithoutTax;

    summary.total += summary.itemTotal + summary.tableFee;

    // apply coupon code
    if (orderData.couponCode && summary.discount == 0) {
      const offer = await this.offerModel.findOne({
        active: true,
        deletedAt: null,
        start: {
          $lte: new Date(moment.utc().format('YYYY-MM-DD')),
        },
        end: {
          $gte: new Date(moment.utc().format('YYYY-MM-DD')),
        },
        code: orderData.couponCode,
      });
      if (offer) {
        if (
          offer.maxNumberAllowed > 0 &&
          offer.maxNumberAllowed <= offer.totalUsed &&
          !orderData._id
        ) {
          throw new BadRequestException(
            `${orderData.couponCode} has been used for its quota`,
          );
        } else {
          const discount =
            offer.discountType == CalculationType.Fixed
              ? offer.discount
              : (summary.itemTotal * offer.discount) / 100;
          summary.discount = offer.maxDiscount
            ? discount > offer.maxDiscount
              ? offer.maxDiscount
              : discount
            : discount;

          summary.total -= summary.discount;
        }
      }
    }

    return summary;
  }
}
