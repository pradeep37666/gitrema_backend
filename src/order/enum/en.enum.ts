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
  NotPaid = 'Not Paid',
  Paid = 'Paid',
  Refunded = 'Refunded',
  PartiallyRefunded = 'Partially Refunded',
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
}
