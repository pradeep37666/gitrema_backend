import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculationService {
  async calculateSummery(orderData) {
    const summary = { subTotal: 0, total: 0, tax: 0 };
    summary.subTotal += orderData.items.reduce(
      (acc, oi) => acc + oi.itemTotal,
      0,
    );
    summary.tax += orderData.items.reduce((acc, oi) => acc + oi.tax, 0);

    // to show subTotal without tax in summary
    summary.subTotal -= summary.tax;

    summary.total = summary.subTotal + summary.tax;
    return summary;
  }
}
