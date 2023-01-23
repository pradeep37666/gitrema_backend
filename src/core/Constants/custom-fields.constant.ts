export enum CustomFields {
  ConfirmationNumber = 'ConfirmationNumber',
  ArrivalDate = 'ArrivalDate',
  BookedOn = 'BookedOn',
  PropertyContactName = 'PropertyContactName',
  PropertyContactEmail = 'PropertyContactEmail',
  PropertyCountry = 'PropertyCountry',
  Currency = 'Currency',
  Address = 'Address',
  Fees = 'Fees',
  FolioBalance = 'FolioBalance',
  RoomChargesOnBooking = 'RoomChargesOnBooking',
  ServiceChargesOnBooking = 'ServiceChargesOnBooking',
  TotalTaxesOnBooking = 'TotalTaxesOnBooking',
  GuestEmail = 'GuestEmail',
  GuestFirstName = 'GuestFirstName',
  GuestLastName = 'GuestLastName',
  GuestPhoneNumber = 'GuestPhoneNumber',
  GuestWhatsappNumber = 'GuestWhatsappNumber',
  SourceName = 'SourceName',
  PropertyCity = 'PropertyCity',
  PropertyDistrict = 'PropertyDistrict',
  PolicyText = 'PolicyText',
  TaxesOnRoomCharges = 'TaxesOnRoomCharges',
  TaxesOnServicesCharges = 'TaxesOnServicesCharges',
  UserBookedName = 'UserBookedName',
  RoomType = 'RoomType',
  MarketSegment = 'MarketSegment',
}

enum CustomFieldHandlers {
  resolveDatabaseFields = 'resolveDatabaseFields',
  resolveReservationFields = 'resolveReservationFields',
  resolveGuestFields = 'resolveGuestFields',
  resolvePropertyFields = 'resolvePropertyFields',
  resolveSupplierFields = 'resolveSupplierFields',
}

enum CustomFieldFormatHandlers {
  formatDate = 'formatDate',
}

enum CustomFieldModels {
  reservationModel = 'reservationModel',
}

export enum CustomFieldQueryKeys {
  reservation = 'reservation',
}

export interface CustomFieldType {
  field: CustomFields;
  handler: CustomFieldHandlers;
  type: string;
  params: {
    model?: CustomFieldModels;
    queryKey?: CustomFieldQueryKeys;
    field?: string;
    formatHandler?: CustomFieldFormatHandlers;
    formateOptions?: any;
  };
}

export const fields: CustomFieldType[] = [
  {
    field: CustomFields.ConfirmationNumber,
    handler: CustomFieldHandlers.resolveDatabaseFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
      field: 'reservationNumber',
    },
  },
  {
    field: CustomFields.ArrivalDate,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
      field: 'startDate',
      formatHandler: CustomFieldFormatHandlers.formatDate,
      formateOptions: { format: 'YYYY-MM-DD' },
    },
  },
  {
    field: CustomFields.PropertyContactName,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.PropertyCountry,
    handler: CustomFieldHandlers.resolvePropertyFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.PropertyCity,
    handler: CustomFieldHandlers.resolvePropertyFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.PropertyDistrict,
    handler: CustomFieldHandlers.resolvePropertyFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.PolicyText,
    handler: CustomFieldHandlers.resolvePropertyFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.PropertyContactEmail,
    handler: CustomFieldHandlers.resolvePropertyFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.Address,
    handler: CustomFieldHandlers.resolvePropertyFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.Currency,
    handler: CustomFieldHandlers.resolveSupplierFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.Fees,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.FolioBalance,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.RoomChargesOnBooking,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.ServiceChargesOnBooking,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.TotalTaxesOnBooking,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.MarketSegment,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.RoomType,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.TotalTaxesOnBooking,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.TaxesOnRoomCharges,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.TaxesOnServicesCharges,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.UserBookedName,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.SourceName,
    handler: CustomFieldHandlers.resolveReservationFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.GuestFirstName,
    handler: CustomFieldHandlers.resolveGuestFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.GuestLastName,
    handler: CustomFieldHandlers.resolveGuestFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.GuestEmail,
    handler: CustomFieldHandlers.resolveGuestFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.GuestPhoneNumber,
    handler: CustomFieldHandlers.resolveGuestFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
  {
    field: CustomFields.GuestWhatsappNumber,
    handler: CustomFieldHandlers.resolveGuestFields,
    type: 'reservation',
    params: {
      model: CustomFieldModels.reservationModel,
      queryKey: CustomFieldQueryKeys.reservation,
    },
  },
];
