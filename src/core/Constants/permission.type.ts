import * as PermissionEnum from './permissions/permissions.enum';

export const Permission = {
  Common: PermissionEnum.CommonPermissions,
  Cashier: PermissionEnum.CashierPermission,
  Customer: PermissionEnum.CustomerPermission,
};
export const PermissionActions = {
  ...PermissionEnum.CommonPermissions,
  ...PermissionEnum.CashierPermission,
  ...PermissionEnum.CustomerPermission,
};

export type PermissionActions =
  | PermissionEnum.CommonPermissions
  | PermissionEnum.CashierPermission
  | PermissionEnum.CustomerPermission;
