export enum OrderEvents {
  OrderCreated = 'Order Created',
  SentToKitchen = 'Sent To Kitchen',
  StartedPreparing = 'Started Preparing',
  DonePreparing = 'Done Preparing',
  OrderPaid = 'Order Paid',
}

export enum RecipientTypes {
  Customer = 'Customer',
  Restaurant = 'Restaurant',
  Waiter = 'Waiter',
}

export enum NotificationStatus {
  Pending = 'Pending',
  Failed = 'Failed',
  Success = 'Success',
}

export enum NotificationType {
  Whatsapp = 'Whatsapp',
  Sms = 'Sms',
  Email = 'Email',
}

export enum Attachments {
  Invoice = 'Invoice',
}
