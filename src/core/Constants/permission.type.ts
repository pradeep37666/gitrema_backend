import * as PermissionEnum from './permissions/permissions.enum';

export const Permission = {
  Common: PermissionEnum.CommonPermissions,
  Cashier: PermissionEnum.CashierPermission,
  Customer: PermissionEnum.CustomerPermission,
  ClientFeedback: PermissionEnum.ClientFeedbackPermission,
  Order: PermissionEnum.OrderPermissions,
  User: PermissionEnum.UserPermission,
  Report: PermissionEnum.ReportPermission,
  Supplier: PermissionEnum.SupplierPermission,
  Restricted: PermissionEnum.RestrictedPermission,
};
export const PermissionActions = {
  ...PermissionEnum.CommonPermissions,
  ...PermissionEnum.CashierPermission,
  ...PermissionEnum.CustomerPermission,
  ...PermissionEnum.ClientFeedbackPermission,
  ...PermissionEnum.OrderPermissions,
  ...PermissionEnum.UserPermission,
  ...PermissionEnum.ReportPermission,
  ...PermissionEnum.SupplierPermission,
  ...PermissionEnum.RestrictedPermission,
};

export type PermissionActions =
  | PermissionEnum.CommonPermissions
  | PermissionEnum.CashierPermission
  | PermissionEnum.CustomerPermission
  | PermissionEnum.ClientFeedbackPermission
  | PermissionEnum.OrderPermissions
  | PermissionEnum.UserPermission
  | PermissionEnum.ReportPermission
  | PermissionEnum.SupplierPermission
  | PermissionEnum.RestrictedPermission;
