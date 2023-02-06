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
}

export enum OrderActivityType {
  OrderPlaced = 'OrderPlaced',
  SittingStart = 'SittingStart',
  MenuScanned = 'MenuScanned',
  SentToKitchen = 'SentToKitchen',
  OrderReady = 'OrderReady',
  PaymentReceived = 'PaymentReceived',
}

export enum PaymentStatus {
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
