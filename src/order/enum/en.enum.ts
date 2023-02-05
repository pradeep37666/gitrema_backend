export enum Source {
  App = 'App',
  Website = 'Website',
  DineIn = 'Dine In',
}

export enum OrderType {
  Pickup = 'Pickup',
  Delivery = 'Delivery',
  DineIn = 'Dine In',
}

export enum OrderStatus {
  New = 'New',
  Processing = 'Processing',
  OnTable = 'On Table',
  Paid = 'Paid',
}

export enum OrderActivityType {
  OrderPlaced = 'OrderPlaced',
  SittingStart = 'SittingStart',
  MenuScanned = 'MenuScanned',
  SentToKitchen = 'SentToKitchen',
  OrderReady = 'OrderReady',
  PaymentReceived = 'PaymentReceived',
}
