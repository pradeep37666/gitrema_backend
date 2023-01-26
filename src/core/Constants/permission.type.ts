import * as PermissionEnum from './permissions/permissions.enum';

export const Permission = {
  Common: PermissionEnum.CommonPermissions,
};
export const PermissionActions = {
  ...PermissionEnum.CommonPermissions,
};

export type PermissionActions = PermissionEnum.CommonPermissions;
