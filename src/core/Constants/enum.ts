export enum Role {
  User = 'User',
  Admin = 'Admin',
  Owner = 'Owner',
  Marketer = 'Marketer',
  HouseKeeper = 'HouseKeeper',
  Maintainer = 'Maintainer',
}

export enum Units {
  SquareFeet = 'Square Feet',
  SquareMeter = 'SquareMeter',
}

export enum SubscriptionType {}

export enum SubscriptionFrequency {}

export enum PropertyTypes {
  Rented = 'Rented',
  ChaletsResorts = 'ChaletsResorts',
  VillasApartments = 'VillasApartments',
  Farms = 'Farms',
  Camps = 'Camps',
  FurnishedApartments = 'FurnishedApartments',
  Hotels = 'Hotels',
  Huts = 'Huts',
}

export enum PrefferedBy {
  Singles = 'Singles',
  Family = 'Family',
  Both = 'Both',
}

export enum BedType {
  King = 'King',
  Queen = 'Queen',
  Twin = 'Twin',
  Double = 'Double',
  Single = 'Single',
  Sofa = 'Sofa',
  Couch = 'Couch',
  AirMattress = 'Air Mattress',
  Bund = 'Bund',
  FloorMattress = 'Floor Mattress',
  Toddler = 'Toddler',
  Crib = 'Crib',
  Water = 'Water',
  Hammock = 'Hammock',
}

export enum RateType {
  Seasoned = 'Seasoned',
}

export enum OfferType {
  Online = 'Online',
  Manual = 'Manual',
}

export enum OfferApplicableType {
  All = 'All',
  Seasoned = 'Seasoned',
}

export enum CalculationType {
  Fixed = 'Fixed',
  Percentage = 'Percentage',
}

export enum Channels {
  Website = 'Website',
  Booking = 'Booking.com',
  Gathern = 'Gathern',
  Almosafer = 'Almosafer',
  Almatar = 'Almatar',
}

export enum PmsServices {
  Housekeeping = 'House keeping',
  Transportation = 'Transportation',
}

export enum ServiceStatusTypes {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export enum AllowedFor {
  Both = 'Both',
  Male = 'Male',
  Female = 'Female',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
}
export enum Frequency {
  None = 'None',
  Daily = 'Daily',
  Weekly = 'Weekly',
}

export enum SectionTypes {
  Bedroom = 'Bedroom',
  Ballroom = 'Ballroom',
  Kitchen = 'Kitchen',
  SwimmingPool = 'Swimming Pool',
  FootballField = 'Football Field',
  BasketballField = 'Basketball Field',
  VolleyballField = 'Volleyball Field',
  LivingRoom = 'Living Room',
  Backyard = 'Backyard',
  GreenArea = 'Green Area',
  GrillArea = 'Grill Area',
  Bathrooms = 'Bathrooms',
  OutsideArea = 'OutsideArea',
  Garden = 'Garden',
  Balcony = 'Balcony',
  WaterPlaying = 'Water Playing',
  Outdoorplayground = 'Outdoor Playground',
  Huts = 'Huts',
  LivingRoomWithPoolView = 'Living Room with pool view',
  Tent = 'Tent',
  SandboxArea = 'Sandbox Area',
  CoveredParking = 'Covered Parking',
  IndoorParking = 'Indoor Parking',
  WoodenHut = 'Wooden',
  SwimmingPoolGradual = 'Swimming Pool',
  Jacuzzi = 'Jacuzzi',
  Saone = 'Saone',
  DJRoom = 'DJ Room',
  HorsesArea = 'Horse Area',
  MasterBedroom = 'MasterBedroom',
  IndoorPool = 'Indoor Pool',
  LeaveHouse = 'Leave House',
  Stage = 'Stage',
  Disp = 'Disp',
}

export enum Days {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export enum AmountType {
  Percentage = 'Percentage',
  Fixed = 'Fixed',
  Nights = 'Nights',
}

export enum CancellationWithRespectTo {
  CheckInDate = 'CheckIn Date', // Within Checkin date
  BookingDate = 'Booking Date', // after the reservation was made
}

export enum ChargeType {
  TotalCharge = 'Total Charge',
  RoomCharge = 'Room Charge',
}

export enum assignmentRule {
  IfUnassigned = 'If Unassigned',
  Always = 'Always',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Failed = 'Failed',
  Success = 'Success',
}

export enum PaymentType {
  Cash = 'Cash',
  Online = 'Online',
}

export enum PriceType {
  Kg = 'Kg',
  Km = 'Km',
  Day = 'Day',
}

export enum ServiceRequestStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum ReservationStatus {
  Booked = 'Booked',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
  InHouse = 'In House',
  Departed = 'Departed',
}

export enum RentalUnitStatus {
  Dirty = 'Dirty',
  Clean = 'Clean',
  Inspection = 'Inspection',
  Blocked = 'Blocked',
}

export enum ConfigurationTypes {
  Reservation,
  CheckIn_Checkout,
  System,
}

export enum AmenityType {
  Hotel = 'Hotel',
  Room = 'Room',
  Both = 'Both',
}
export enum TaxType {
  Fee = 'Fee',
  Tax = 'Tax',
}

export enum EmailTemplateStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Obsolete = 'Obsolete',
}

export enum EmailTemplateType {
  Reservation = 'Reservation',
  Account = 'Account',
}

export enum TriggerType {
  None = 'None',
  On = 'On',
  Before = 'Before',
  After = 'After',
}

export enum NotificationRecipients {
  Guest = 'Guest',
  Supplier = 'Supplier',
  Marketing = 'Marketing',
  HotelOwner = 'Hotel Owner',
  Admin = 'Admin',
}

export enum EmailAttachments {
  GuestRegistration = 'Guest Registration',
  GuestStatement = 'Guest Statement',
}

export enum EmailTemplateEvent {
  Reserved = 'Reserved',
  Confirmed = 'Confirmed',
  Guaranteed = 'Guaranteed',
  InHouse = 'In-House',
  Departed = 'Departed',
  OnHold = 'On Hold',
  NoShow = 'No Show',
  Cancelled = 'Cancelled',
  Quote = 'Quote',
  ArrivalDate = 'Arrival Date',
  DepartureDate = 'Departure Date',
  DateChange = 'Date Change',
  RateChange = 'Rate Change',
  RoomChange = 'Room Change',
  AddOnPurchase = 'AddOnPurchase',
  SpnServicePurchase = 'SpnServicePurchase',
}
export enum EmailTemplateBeforeEvent {
  InHouse = 'In-House',
  Departed = 'Departed',
  ArrivalDate = 'Arrival Date',
  DepartureDate = 'Departure Date',
}

export enum FileUploadType {
  images = 'Images',
  videos = 'Videos',
  ids = 'Ids',
}

export enum DerivedOfferType {
  LessThan = 'lesser than',
  GreaterThan = 'greater than',
}

export enum PolicyType {
  Deposit = 'Deposit',
  Cancellation = 'Cancellation',
  CheckIn = 'Check-in',
  NoShow = 'No-Show',
  Insurance = 'Insurance',
}

export enum ChargeCollectionType {
  Captured = 'Captured',
  Authorized = 'Authorized',
}

export enum ProfileStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Obsolete = 'Obsolete',
}

export enum FileDocumentType {
  Passport = 'Passport',
  DriverLicense = 'Driver License',
  ID = 'ID',
  Visa = 'Visa',
  AadhaarCard = 'Aadhaar Card',
  BirthCertificate = 'Birth Certificate',
}
export enum NotesType {
  Internal = 'Internal',
  GuestNote = 'Guest Note',
  Complaint = 'Complaint',
  Message = 'Message',
}

export enum ChargeBy {
  Night = 'Night',
  Stay = 'Stay',
  Interval = 'Interval',
}

export enum AddonFor {
  Room = 'Room',
  Person = 'Person',
  Adult = 'Adult',
  Child = 'Child',
}
export enum VehicleTypes {
  Car = 'Car',
  Motercycle = 'Motercycle/Scooter',
  RV = 'RV/Camper',
  Truck = 'Truck',
  Boat = 'Boat',
}
export enum ListType {
  TableRegion = 'Table Region',
}
export enum ListStatus {
  Active = 'Active',
  InActive = 'Inactive',
  Obsolete = 'Obsolete',
}

export enum ActivityCategory {
  Reservation = 'Reservation',
  Payment = 'Payment',
}

export enum FolioStatus {
  Pending = 'Pending',
  Posted = 'Posted',
}

export enum FolioType {
  Charge = 'Charge',
  Payment = 'Payment',
  Refund = 'Refund',
}

export enum MemoType {
  Credit = 'Credit',
  Debit = 'Debit',
}

export enum DefaultLedgerAccountSlug {
  RoomCharge = 'RoomCharge',
  Incidental = 'Incidental',
  Cash = 'Cash',
  Card = 'Card',
  Amex = 'Amex',
  Visa = 'Visa',
  MC = 'Mastercard',
  Mada = 'Mada',
  Check = 'Check',
  Account = 'Account',
  GiftCertificate = 'Gift Certificate',
  CancellationFee = 'Cancellation Fee',
  Fee = 'Fee',
}

export enum DefaultLedgerAccountTypeSlug {
  RoomCharge = 'RoomCharge',
  Incidental = 'Incidental',
  PaymentMethod = 'PaymentMethod',
  Fee = 'Fee',
}

export enum UnitOfMeasure {
  Each = 'Each',
  Piece = 'Piece',
  NumberOfPeople = 'Number Of People',
  NumberOfNights = 'Number Of Nights',
}

export enum DisplayFor {
  Guest = 'Guest',
  Hotel = 'Hotel',
}

export enum RoleSlug {
  Visitor = 'Visitor',
  Customer = 'Customer',
  SupplierAdmin = 'Supplier Admin',
  SuperAdmin = 'Super Admin',
}

export enum CustomEvent {
  ForgotPassword = 'Forgot Password',
  ChangePassword = 'Change Password',
}

export enum GuestServiceType {
  Addon = 'Addon',
  Spn = 'Spn',
}

export enum GuestServiceStatus {
  Received = 'Received',
  Contacted = 'Contacted',
  Scheduled = 'Scheduled',
  Done = 'Done',
  Disputed = 'Disputed',
}

export enum OtpStatus {
  Pending = 'Pending',
  Used = 'Used',
}

export enum ScheduledCronTaskType {
  Email = 'Email',
}

export enum PaymentTarget {
  RoomCharge = 'Room Charge',
  Addon = 'Addon',
  Spn = 'Spn',
}

// e-menu enums
export enum OrderTypes {
  All = 'All',
  Pickup = 'Pickup',
  Delivery = 'Delivery',
  Local = 'Local',
}
