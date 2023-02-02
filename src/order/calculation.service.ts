import { Injectable } from '@nestjs/common';
import { LeanDocument } from 'mongoose';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

@Injectable()
export class CalculationService {
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

    return summary;
  }
}
