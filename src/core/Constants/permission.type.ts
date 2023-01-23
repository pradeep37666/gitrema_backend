import * as PermissionEnum from './permissions/permissions.enum';

export const Permission = {
  //   Supplier: { ...PermissionEnum.CommonPermissions },
  //   LedgerAccount: { ...PermissionEnum.CommonPermissions },
  Common: PermissionEnum.CommonPermissions,
  Guest: { ...PermissionEnum.GuestPermission },
  Reservation: { ...PermissionEnum.ReservationPermission },
  ServiceRequest: { ...PermissionEnum.PropertyServiceRequestPermissions },
};
export const PermissionActions = {
  ...PermissionEnum.CommonPermissions,
};

export type PermissionActions =
  | PermissionEnum.PropertyServiceRequestPermissions
  | PermissionEnum.CommonPermissions
  | PermissionEnum.GuestPermission
  | PermissionEnum.ReservationPermission;
