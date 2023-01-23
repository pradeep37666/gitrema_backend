import { SetMetadata } from '@nestjs/common';
import { PermissionSubject } from '../Constants/permissions/permissions.enum';
import { PermissionActions } from '../Constants/permission.type';

export const PERMISSION = 'PermissionGuard';

export const PermissionGuard = (
  subject: PermissionSubject,
  permission: PermissionActions,
) => SetMetadata(PERMISSION, { subject, permission });
