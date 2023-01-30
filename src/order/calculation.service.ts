import { Injectable } from '@nestjs/common';
import { LeanDocument } from 'mongoose';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

@Injectable()
export class CalculationService {
  async calculateSummery(orderData, supplier: LeanDocument<SupplierDocument>) {
    const summary = {
      subTotal: 0,
      total: 0,
      tax: 0,
      tableFeeWithoutTax: 0,
      tableFee: 0,
    };

    if (orderData.tableFee) {
      summary.tableFee = orderData.tableFee;

      const taxRate = supplier.taxRate ?? 15;
      summary.tableFeeWithoutTax = supplier.taxEnabledOnTableFee
        ? parseFloat((orderData.tableFee / (1 + taxRate / 100)).toFixed(2))
        : orderData.tableFee;
    }
    summary.total += orderData.items.reduce((acc, oi) => acc + oi.itemTotal, 0);
    summary.tax += orderData.items.reduce((acc, oi) => acc + oi.tax, 0);

    // to show subTotal without tax in summary
    summary.subTotal = summary.total - summary.tax;

    summary.tax += summary.tableFee - summary.tableFeeWithoutTax;

    summary.total += summary.tableFee;

    return summary;
  }
}
