export enum PermissionSubject {
  ALL = 'ALL',
  Admin = 'Admin',
  Supplier = 'Supplier',
  Role = 'Role',
  Transaction = 'Transaction',
  User = 'User',
  EmailTemplate = 'Email Template',
  CustomFields = 'Custom Fields',
  Restaurant = 'Restaurant',
  Table = 'Table',
  MenuCategory = 'Menu Category',
  MenuAddition = 'Menu Addition',
  MenuItem = 'Menu Item',
  KitchenQueue = 'Kitchen Queue',
  QrCode = 'Qr Code',
  Cashier = 'Cashier',
  ClientComment = 'Client Comment',
  ClientFeedback = 'Client Feedback',
  PaymentSetup = 'Payment Setup',
  List = 'List',
  Activity = 'Activity',
  WaitingQueue = 'Waiting Queue',
  Reservation = 'Reservation',
  Order = 'Order',
  Business = 'Business',
  Offer = 'Offer',
  Invoice = 'Invoice',
  Customer = 'Customer',
  ScreenDisplay = 'Screen Display',
  Feature = 'Feature',
  Package = 'Package',
  Import = 'Import',
  GlobalConfig = 'Global Config',
  Report = 'Report',
  Delivery = 'Delivery',
}
export enum SubjectsRestrictedForSupplier {
  ALL = 'ALL',
  Supplier = 'Supplier',
  ScreenDisplay = 'Screen Display',
  Feature = 'Feature',
  Package = 'Package',
}
export enum CommonPermissions {
  LIST = 'LIST',
  FETCH = 'FETCH',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  START = 'START',
  CLOSE = 'CLOSE',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  CANCEL = 'CANCEL',
  MANAGE = 'MANAGE',
}

export enum CashierPermission {
  OverrideCashierClose = 'Override Cashier Close',
}

export enum CustomerPermission {
  CustomerProfileFetch = 'Customer Profile Fetch',
  CustomerProfileUpdate = 'Customer Profile Update',
}

export enum ClientFeedbackPermission {
  SubmitFeedback = 'Submit Feedback',
  ListFeedback = 'List Feedback',
}

export enum OrderPermissions {
  CancelOrder = 'Cancel Order',
  SentToKitchen = 'Sent To Kitchen',
  OnTable = 'On Table',
}

export enum UserPermission {
  ImpersonateSupplier = 'Impersonate Supplier',
  ChangeUserPassword = 'Change User Password',
}

export enum ReportPermission {
  PayoutPreview = 'Payout Preview',
}
