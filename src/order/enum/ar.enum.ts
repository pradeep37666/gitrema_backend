export enum Source {
  App = 'من التطبيق',
  Website = 'من الموقع',
  DineIn = 'محلي',
}

export enum OrderType {
  ToGo = 'طلبات سفري',
  Pickup = 'طلبات استلام',
  Delivery = 'طلبات توصيل',
  DineIn = 'طلبات محلي',
}

export enum OrderStatus {
  New = 'جديد',
  SentToKitchen = 'ارسل للمطبخ',
  StartedPreparing = 'بدئ التحضير',
  DonePreparing = 'الطلب جاهز',
  OnTable = 'على الطاولة',
  Closed = 'مقفل',
  Cancelled = 'ملغي',
  CancelledByMerge = 'مدمج',
  CancelledWihPaymentFailed = 'ملغي لفشل عملية الدفع',
  Reset = 'اعادة فتح',
}

export enum OrderPaymentStatus {
  NotPaid = 'غير مدفوع',
  Paid = 'مدفوع',
  Refunded = 'تم الارجاع',
  PartiallyRefunded = 'تم الارجاع جزئياً',
  Pending = 'الدفع تحت الاجراء',
  OverPaid = 'دفع فائض',
  Deferred = 'دفع بالأجل',
}

export enum InvoiceStatus {
  Invoiced = 'اصدرت الفاتورة',
  Reversed = 'الغيت الفاتورة',
  CreditMemo = 'ايصال ارجاع',
}

export enum PreparationStatus {
  NotStarted = 'لم يبدئ التحضير',
  StartedPreparing = 'بدئ التحضير',
  DonePreparing = 'انتهى التحضير',
}
