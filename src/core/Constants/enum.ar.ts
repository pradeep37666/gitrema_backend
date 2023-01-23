export enum Role {
  User = 'المستعمل',
  Admin = 'مسؤل',
  Owner = 'صاحب',
  Marketer = 'المسوق',
  HouseKeeper = 'مدبرة المنزل',
  Maintainer = 'عامل صيانة',
}

export enum Units {
  SquareFeet = 'قدم مربع',
  SquareMeter = '	متر مربع',
}

export enum SubscriptionType {}

export enum SubscriptionFrequency {}

export enum PropertyTypes {
  Rented = 'تأجير',
  ChaletsResorts = 'شاليهات، منتجعات، أستراحات',
  VillasApartments = 'شقق و فلل وبيوت خاصة',
  Farms = 'مزارع',
  Camps = 'مخيمات',
  FurnishedApartments = 'شقق مفروشة',
  Hotels = 'فنادق',
  Huts = 'اكواخ',
}

export enum PrefferedBy {
  Singles = 'افراد',
  Family = 'عوائل',
  Both = 'للجميع',
}

export enum BedType {
  King = 'سرير ماستر كبير',
  Queen = 'سرير متوسط',
  Twin = 'سرير فردي',
  Double = 'سرير زوج',
  Single = 'سرير صغير',
  Sofa = 'سرير كرسي',
  Couch = 'سرير كنبة',
  AirMattress = 'سرير هوائي',
  Bund = 'سرير دورين فردي',
  FloorMattress = 'سرير ارضي',
  Toddler = 'سرير للاطفال',
  Crib = 'سرير للرضع والصغار في السن',
  Water = 'سرير مائي',
  Hammock = 'سرير معلق - هاموك',
}

export enum RateType {
  Seasoned = 'زمني',
}

export enum OfferType {
  Online = 'اونلاين',
  Manual = 'زمني',
}

export enum OfferApplicableType {
  All = 'للجميع',
  Seasoned = 'زمني',
}

export enum CalculationType {
  Fixed = 'سعر ثابت',
  Percentage = 'نسبة',
}

export enum Channels {
  Website = 'عبر الموقع',
  Booking = 'بوكينغ',
  Gathern = 'جاذرن',
  Almosafer = 'المسافر',
  Almatar = 'المطار',
}

export enum PmsServices {
  Housekeeping = 'النظافة',
  Transportation = 'المواصلات',
}

export enum ServiceStatusTypes {
  Pending = 'لم تبدى ',
  InProgress = 'قيد التنفيذ',
  Completed = 'تمت بنجاح',
}

export enum AllowedFor {
  Both = 'للجميع',
  Male = 'ذكر',
  Female = 'انثى',
}

export enum Gender {
  Male = 'ذكر',
  Female = 'أنثى',
}
export enum Frequency {
  None = 'لا تكرار',
  Daily = 'يومي',
  Weekly = 'اسبوعي',
}

export enum SectionTypes {
  Bedroom = 'غرفة نوم',
  Ballroom = 'صالة افراح',
  Kitchen = 'مطبخ',
  SwimmingPool = 'مسبح',
  FootballField = 'ملعب كرة قدم',
  BasketballField = 'ملعب سلة',
  VolleyballField = ' ملعب طائرة',
  LivingRoom = ' صالة',
  Backyard = ' فناء خارجي',
  GreenArea = ' مسطحات زراعية',
  GrillArea = ' ركن للشواء',
  Bathrooms = ' حمامات',
  OutsideArea = ' جلسة خارجية',
  Garden = ' حديقة',
  Balcony = ' بلكونة',
  WaterPlaying = ' العاب مائية',
  Outdoorplayground = ' العاب اطفال خارجية',
  Huts = ' كوخ ريفي',
  LivingRoomWithPoolView = 'صاله مطله على المسبح',
  Tent = ' خيمة',
  SandboxArea = ' العاب رملية',
  CoveredParking = ' مواقف مظللة',
  IndoorParking = ' مواقف داخلية',
  WoodenHut = ' كوخ خشبي',
  SwimmingPoolGradual = ' مسبح متدرج',
  Jacuzzi = ' جاكوزي',
  Saone = ' ساونا',
  DJRoom = ' غرفة دي جي',
  HorsesArea = ' اسطبل خيول',
  MasterBedroom = ' غرفة بحمام',
  IndoorPool = ' مسبح داخلي',
  LeaveHouse = ' بيت شعر',
  Stage = ' كوشة (ستيج)',
}

export enum Days {
  Monday = 'الاثنين',
  Tuesday = 'الثلاثاء',
  Wednesday = 'الأربعاء',
  Thursday = 'الخميس',
  Friday = 'الجمعة',
  Saturday = 'السبت',
  Sunday = 'الأحد',
}

export enum AmountType {
  Percentage = 'نسبة مئوية',
  Fixed = 'قيمة ثابتة',
  Nights = 'بعد ليالي المبيت',
}

export enum CancellationWithRespectTo {
  CheckInDate = 'تاريخ تسجيل الوصول', // Within Checkin date
  BookingDate = 'تاريخ الحجز', // after the reservation was made
}

export enum ChargeType {
  TotalCharge = 'القيمة الاجمالية',
  RoomCharge = 'قيمة المساحة التأجيرية',
}

export enum assignmentRule {
  IfUnassigned = ' مالم يتم تعيينها',
  Always = '	دائماً',
}

export enum PaymentStatus {
  Pending = 'معلق',
  Failed = 'فشل',
  Success = 'نجاح',
}

export enum PaymentType {
  Cash = '	دفع نقدي',
  Online = '	دفع الكتروني',
}

export enum PriceType {
  Kg = 'كجم',
  Km = 'كم',
  Day = 'يوم',
}

export enum ServiceRequestStatus {
  Pending = '	معلق',
  InProgress = 'قيد التنفيذ',
  Completed = 'انتهاء',
  Cancelled = 'الغاء',
}

export enum ReservationStatus {
  Booked = 'محجوز',
  Confirmed = 'مؤكد',
  Cancelled = 'ملغى',
  InHouse = 'داخلي',
  Departed = 'غادر',
}

export enum RentalUnitStatus {
  Dirty = 'متسخ',
  Clean = 'نظيف',
  Inspection = 'فحص',
  Blocked = 'محظور',
}

export enum ConfigurationTypes {
  Reservation = '	حجز	',
  CheckIn_Checkout = 'الدخول والخروج	',
  System = 'نظام',
}

export enum AmenityType {
  Hotel = 'فندق',
  Room = 'غرفة',
  Both = 'كلاهما',
}
export enum TaxType {
  Fee = 'رسوم',
  Tax = 'ضرائب',
}

export enum EmailTemplateStatus {
  Active = 'فعّال',
  Inactive = 'غير فعّال',
  Obsolete = 'مهمل',
}

export enum EmailTemplateType {
  Reservation = 'حجز	',
  Account = 'حساب',
}

export enum TriggerType {
  None = 'بدون',
  On = 'تشغيل',
  Before = 'قبل',
  After = 'بعد',
}

export enum NotificationRecipients {
  Guest = 'ضيف',
  Supplier = 'المورد',
  Marketing = 'تسويق',
  HotelOwner = 'مالك العقار',
}

export enum EmailAttachments {
  GuestRegistration = 'تسجيل الضيف',
  GuestStatement = 'بيان الضيف	',
}

export enum EmailTemplateEvent {
  Reserved = 'محجوز',
  Confirmed = 'مؤكد',
  Guaranteed = 'مضمون',
  InHouse = 'داخلي',
  Departed = 'غادر',
  OnHold = 'في الانتظار',
  NoShow = 'عدم الحضور',
  Cancelled = 'تم الإلغاء',
  Quote = 'تسعير',
  ArrivalDate = 'تاريخ الوصول',
  DepartureDate = 'تاريخ المغادرة	',
  DateChange = 'تحديث التاريخ',
  RateChange = 'تحديث التسعير',
  RoomChange = 'تغيير الغرفة',
  ForGuestSign = 'توقيع الضيف',
}

export enum FileUploadType {
  images = 'صور	',
  videos = 'فيديو',
  ids = '',
}

export enum DerivedOfferType {
  LessThan = 'اصغر من',
  GreaterThan = 'اكبر من',
}

export enum PolicyType {
  Deposit = 'عربون',
  Cancellation = 'الغاء',
  CheckIn = 'تسجيل الدخول',
  NoShow = 'عدم الحضور',
  Insurance = 'تأمين',
}

export enum ChargeCollectionType {
  Captured = 'القيمة المحسوبة',
  Authorized = 'مخوّل',
}

export enum ProfileStatus {
  Active = 'فعّال',
  Inactive = 'غير فعّال',
  Obsolete = 'مهمل',
}
export enum PaymentMethod {
  Amex = 'امريكان اكسبرس',
  Visa = 'فيزا',
  MC = '',
  Mada = 'مدى	',
  Check = 'شيك	',
  Cash = 'نقدي',
  Account = 'حساب',
  GiftCertificate = 'هدية',
  Online = 'الكتروني',
}
export enum FileDocumentType {
  Passport = 'جواز سفر',
  DriverLicense = 'رخصة القيادة',
  ID = 'الهوية الوطنية/الإقامة',
  Visa = 'الفيزا',
  AadhaarCard = 'Aadhaar Card',
  BirthCertificate = 'شهادة الميلاد ',
}
export enum NotesType {
  Internal = 'داخلي',
  GuestNote = 'ملاحظات الضيف',
  Complaint = 'شكاوى',
  Message = 'رسالة',
}

export enum ChargeBy {
  Night = 'ليلة',
  Stay = 'إقامة',
  Interval = 'المدة',
}

export enum AddonFor {
  Room = 'المساحة التأجيرية',
  Person = 'شخص	',
  Adult = 'بالغ',
  Child = 'طفل',
}
export enum VehicleTypes {
  Car = 'مركبة',
  Motercycle = 'دراجة نارية',
  RV = 'عربة تخييم',
  Truck = 'شاحنة',
  Boat = 'قارب',
}
export enum ListType {
  Referral = 'إحالة/توصية',
  MarketSegment = 'الشريحة التسويقية',
  Maintenance = 'صيانة',
  NotesTypes = 'نوع الملاحظة',
  HousekeepingZones = 'منطفة التنظيف',
}
export enum ListStatus {
  Active = 'فعّال',
  InActive = 'غير فعّال',
  Obsolete = 'مهمل',
}

export enum ActivityCategory {
  Reservation = 'حجز',
  Payment = 'دفع	',
}

export enum FolioStatus {
  Pending = 'معلق',
  Posted = 'عمّد',
}

export enum FolioType {
  Charge = 'تكلفة',
  Payment = 'دفع',
  Refund = 'استرجاع',
}

export enum DefaultLedgerAccountSlug {
  RoomCharge = 'رسوم المساحة التأجيرية',
  Incidental = 'إضافي',
  Cash = 'نقدي',
  Card = 'بطاقة',
  Amex = 'أمريكان اكسبرس',
  Visa = 'فيزا',
  MC = 'Mastercard',
  Mada = 'مدى',
  Check = 'شيك',
  Account = 'حساب',
  GiftCertificate = 'هدية',
  CancellationFee = 'رسوم الغاء',
}
export enum DefaultLedgerAccountTypeSlug {
  RoomCharge = 'رسوم المساحة التأجيرية',
  Incidental = 'إضافي',
  PaymentMethod = 'طريقة الدفع',
}

export enum OrderTypes {
  All = 'كل انواع الطلبات',
  Pickup = 'طلبات استلام',
  Delivery = 'طلبات توصيل',
  Local = 'طلبات محلية',
}
