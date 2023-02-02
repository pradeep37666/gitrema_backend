import * as PermissionEnum from './permissions/permissions.enum';

export const Permission = {
  Common: PermissionEnum.CommonPermissions,
  Cashier: PermissionEnum.CashierPermission,
};
export const PermissionActions = {
  ...PermissionEnum.CommonPermissions,
  ...PermissionEnum.CashierPermission,
};

export type PermissionActions =
  | PermissionEnum.CommonPermissions
  | PermissionEnum.CashierPermission;
