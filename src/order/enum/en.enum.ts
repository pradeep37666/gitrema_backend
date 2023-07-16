export enum Source {
  App = 'App',
  Website = 'Website',
  DineIn = 'Dine In',
}

export enum OrderType {
  ToGo = 'To Go',
  Pickup = 'Pickup',
  Delivery = 'Delivery',
  DineIn = 'Dine In',
}

export enum OrderStatus {
  New = 'New',
  SentToKitchen = 'Sent To Kitchen',
  StartedPreparing = 'Started Preparing',
  DonePreparing = 'Done Preparing',
  OnTable = 'On Table',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
  CancelledByMerge = 'Cancelled By Merge',
  CancelledWihPaymentFailed = 'Cancelled Wih Payment Failed',
  Reset = 'Reset',
}

export enum OrderActivityType {
  OrderPlaced = 'OrderPlaced',
  SittingStart = 'SittingStart',
  MenuScanned = 'MenuScanned',
  SentToKitchen = 'SentToKitchen',
  OrderReady = 'OrderReady',
  PaymentReceived = 'PaymentReceived',
  Refunded = 'Refunded',
}

export enum OrderPaymentStatus {
  Pending = 'Pending',
  NotPaid = 'Not Paid',
  Paid = 'Paid',
  OverPaid = 'Over Paid',
  Refunded = 'Refunded',
  PartiallyRefunded = 'Partially Refunded',
  Deferred = 'Deferred',
}

export enum InvoiceStatus {
  Invoiced = 'Invoiced',
  Reversed = 'Reversed',
  CreditMemo = 'Credit Memo',
}

export enum PreparationStatus {
  NotStarted = 'Not Started',
  StartedPreparing = 'Started Preparing',
  DonePreparing = 'Done Preparing',
  OnTable = 'On Table',
}
