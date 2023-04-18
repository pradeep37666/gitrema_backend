export enum OrderEvents {
  OrderCreated = 'انشاء الطلب',
  SentToKitchen = 'الارسال للمطبخ',
  StartedPreparing = 'بدئ التحضير',
  DonePreparing = 'الاتهاء من التحضير',
  OrderPaid = 'دفع الطلب',
}

export enum RecipientTypes {
  Customer = 'العميل',
  Restaurant = 'المطعم',
}

export enum NotificationStatus {
  Pending = 'قيد الاتمام',
  Failed = 'فشل الارسال',
  Success = 'تم الارسال',
}

export enum NotificationType {
  Whatsapp = 'Whatsapp',
  Sms = 'Sms',
  Email = 'Email',
}

export enum Attachments {
  Invoice = 'Invoice',
}
