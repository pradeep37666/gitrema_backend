export const VALIDATION_MESSAGES = {
  Unauthorised: {
    key: `Unauthorised`,
    en: 'Invalid Credentials',
    ar: 'غير مصرح  بالدخول',
  },
  ServerError: {
    key: `ServerError`,
    en: 'Something went wrong',
    ar: 'حدث خطأ ما, الرجاء التواصل مع الشركة',
  },
  InvalidAlias: {
    key: `InvalidAlias`,
    en: 'Invalid alias',
    ar: 'رمز العميل خاطئ',
  },
  SameEmailExist: {
    key: `SameEmailExist`,
    en: 'User exists with same email',
    ar: 'هذا الايميل مستخدم من قبل عميل سابق',
  },
  ErrorSms: {
    key: `ErrorSms`,
    en: 'Error Sending SMS',
    ar: 'حدث خطئ اثناء ارسال الرسالة',
  },
  OtpFailed: {
    key: `OtpFailed`,
    en: 'OTP Verification Failed',
    ar: 'رمز التعريف خاطيء',
  },
  RoleNotFound: {
    key: `RoleNotFound`,
    en: 'Role is not defined. Please contact admin',
    ar: 'لايوجد لديك الصلاحياة الازمة, تحدث مع المسؤول',
  },
  UserNotRegistered: {
    key: `UserNotRegistered`,
    en: 'User is not registered yet',
    ar: 'الحساب غير مسجل',
  },
  RecordNotFound: {
    key: `RecordNotFound`,
    en: 'Record does not exist for provided details',
    ar: 'لايوجد حساب للمعلومات المدخلة',
  },
  SupplierInactive: {
    key: `SupplierInactive`,
    en: 'Supplier is not activated! Please contact administrator',
    ar: 'العميل غير منشط من قبل الشركة',
  },
  NoCashierAvailable: {
    key: `NoCashierAvailable`,
    en: 'Cashier is not available',
    ar: 'الكاشير غير معرف',
  },
  PreviousOpenInstance: {
    key: `PreviousOpenInstance`,
    en: 'Previous instance is not closed yet',
    ar: 'وردية الكاشير السابقة غير مغلقة',
  },
  NoOpenInstance: {
    key: `NoOpenInstance`,
    en: 'No instance open to close',
    ar: 'لايوجد وردية كاشير مفتوحة لاقفالها ',
  },
  AlreadyPaused: {
    key: `AlreadyPaused`,
    en: 'Instance is already paused',
    ar: 'الكاشير في حالة ايقاف او راحة',
  },
  NothingToResume: {
    key: `NothingToResume`,
    en: 'Nothing to resume',
    ar: 'لايوجد وردية كاشير مفتوحة لاايقافها',
  },
  PaymentError: {
    key: `PaymentError`,
    en: 'Something went wrong while initiating the payment',
    ar: 'حدث خطأ اثناء عملية الدفع',
  },
  CustomerExist: {
    key: `CustomerExist`,
    en: 'Customer exists for provided phone number',
    ar: 'يوجد عميل بنفس رقم الهاتف',
  },
  ImportFailed: {
    key: `ImportFailed`,
    en: 'Failed to create the import',
    ar: 'فشلت عملية الادخال',
  },
  InvoiceError: {
    key: `InvoiceError`,
    en: 'Error generating invoice',
    ar: 'حدث خطأ اثناء عملية انشاء الفاتورة',
  },
  KitchenReceiptError: {
    key: `KitchenReceiptError`,
    en: 'Error generating kitchen receipt',
    ar: 'حدث خطئ اثناء طباعة ايصال المطبخ',
  },
  InvoicePrintError: {
    key: `InvoicePrintError`,
    en: 'Error generating invoice to print',
    ar: 'حدث خطئ اثناء طباعة ايصال الكاشير',
  },
  InvoiceExists: {
    key: `InvoiceExists`,
    en: 'Invoice already exists',
    ar: 'تم انشاء الفاتورة سابقاً',
  },
  RefInvoiceNotFound: {
    key: `RefInvoiceNotFound`,
    en: 'Referenced Invoice not found',
    ar: 'لايوجد المرجع للفاتورة',
  },
  AlreadyCancelled: {
    key: `AlreadyCancelled`,
    en: 'Already cancelled',
    ar: 'تم الالغاء',
  },
  CancelCreditMemo: {
    key: `CancelCreditMemo`,
    en: 'Please cancel the credit memo first',
    ar: 'الرجاء الغاء عملية الارجاع اولاً',
  },
  InvoiceNotFound: {
    key: `InvoiceNotFound`,
    en: 'Invoice not found',
    ar: 'لايوجد فاتورة مسبقة',
  },
  RestaurantClosed: {
    key: `RestaurantClosed`,
    en: 'Restaurant is closed',
    ar: 'المطعم الان مغلق ولايستقبل طلبات',
  },
  OrderClosed: {
    key: `OrderClosed`,
    en: 'Order is closed. No changes can be made',
    ar: 'لايمكن تغيير او اضافة على الطلب الان',
  },
  AllOrderClosed: {
    key: `AllOrderClosed`,
    en: 'All provided orders are either closed or cancelled',
    ar: 'الطلبات المختارة مغلقة او ملغية',
  },
  SameTableMergeNotAllowed: {
    key: `SameTableMergeNotAllowed`,
    en: 'Merge only allowed for orders within the same table',
    ar: 'لايسمح دمج طلبات من طاولات مختلفة',
  },
  NoSubscription: {
    key: `NoSubscription`,
    en: 'No active subscription! Please contact administrator',
    ar: 'لايوجد اي اشتراك لك – الرجاء التواصل مع الشركة',
  },
  SubscriptionActionNotAllowed: {
    key: `SubscriptionActionNotAllowed`,
    en: 'Action not allowed for the subscribed package',
    ar: 'العملية التي اخترتها لايمكن اتمامها مع هذا الاشتراك – الرجاء التواصل مع الشركة للترقية او التعديل',
  },
  DomainNotFound: {
    key: `DomainNotFound`,
    en: 'Domain not set',
    ar: 'لايوجد اسم مختار للموقع',
  },
  TableNotFound: {
    key: `TableNotFound`,
    en: 'Table not found',
    ar: 'لاتوجد طاولة',
  },
  ErrorQrCode: {
    key: `ErrorQrCode`,
    en: 'Error Generating Qrcode',
    ar: 'خطاء اثناء انشاء رموز الاستجابة (كيو ار كود)',
  },
  CanNotBeDeleted: {
    key: `CanNotBeDeleted`,
    en: 'Record is referenced so can not be deleted',
    ar: 'البيان مستخدم مسبقا ولايمكن حذفه',
  },
  SameAlias: {
    key: `SameAlias`,
    en: 'A record already exists with same alias',
    ar: 'رمز العميل مستخدم مسبقاً',
  },
  SameDomain: {
    key: `SameDomain`,
    en: 'A record already exists with same domain',
    ar: 'اسم الموقع مستخدم مسبقاً',
  },
  DomainNotAllowed: {
    key: `DomainNotAllowed`,
    en: 'Domain not allowed',
    ar: 'اسم الموقع غير مسموح به',
  },
  NoTrialPeriod: {
    key: `NoTrialPeriod`,
    en: 'Package does not provide trial period',
    ar: 'الباقة لاتقبل حسابات تجريبية',
  },
  PackageNotFound: {
    key: `PackageNotFound`,
    en: 'Package not found',
    ar: 'لايوجد باقة متوفرة او منشأة',
  },
  TableStarted: {
    key: `TableStarted`,
    en: 'Table is already started',
    ar: 'قد تم بدئ الطاولة مسبقاً',
  },
  TableNotStarted: {
    key: `TableNotStarted`,
    en: 'Table has not started yet',
    ar: 'لم يتم بدئ الطاولة',
  },
  OrdersPendingToClose: {
    key: `OrdersPendingToClose`,
    en: 'Some of the orders are not closed yet',
    ar: 'بعض الطلبات على الطولة غير مدفوعة',
  },
  InvalidUserId: {
    key: `InvalidUserId`,
    en: 'Provided userId is invalid or logged in user does not have the access to perform this action',
    ar: 'الحساب المعطى غير صحيح او لايملك الصلاحيات لهذه العملية',
  },
  MenuItemNotAvailable: {
    key: `MenuItemNotAvailable`,
    en: '{{p1}} is not available',
    ar: 'لايوجدج هذا الصنف بهذا الرقم {{p1}}',
  },
  SoldOut: {
    key: `SoldOut`,
    en: '{{p1}} is sold out',
    ar: 'هذا الصنف {{p1}} نفذ',
  },
  SameStatus: {
    key: `SameStatus`,
    en: 'Order is already on {{p1}}',
    ar: 'حالة الطلب: {{p1}}',
  },
  OverPayment: {
    key: `OverPayment`,
    en: 'This will result in an overpayment. Pending amount to collect is {{p1}}',
    ar: 'الدفع لهذا ملغي لتفادي اكثر من الازم – المبلغ المتبغي هو {{p1}}',
  },
  PermissionNotAllowed: {
    key: `PermissionNotAllowed`,
    en: '{{p1}} are not allowed for supplier',
    ar: 'هذه الخيارات غير مسموحة لصلاحيات العميل: {{p1}}',
  },
  NoBalanceMatch: {
    key: `NoBalanceMatch`,
    en: 'Closing balance is not matching the current balance. Difference is {{p1}}',
    ar: 'مبلغ الكاش في الصندوق لا يساوي المبلغ المستلم في الوردية. الفرق هو: {{p1}}',
  },
  MenuCategoryMandatory: {
    key: 'MenuCategoryMandatory',
    en: 'You must select item categoy',
    ar: 'يجب اختيار القسم للمنتج',
  },
};
