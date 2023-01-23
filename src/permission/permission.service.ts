import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { PermissionActions } from 'src/core/Constants/permission.type';
import {
  CommonPermissions,
  PermissionSubject,
} from 'src/core/Constants/permissions/permissions.enum';
import { Role, RoleDocument } from 'src/role/schemas/roles.schema';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>, //private cacheService: CacheService,
  ) {}
  async userHasPermission(
    user: any, // set the type of logged in user dto
    subject: PermissionSubject,
    permission: PermissionActions,
  ) {
    const role = await this.roleModel.findById(user.roleId).lean();

    if (!role) return false;

    const wildcardPermissionObj = role.permissions.find((p) => {
      return p.subject == PermissionSubject.ALL;
    });

    if (
      wildcardPermissionObj &&
      (wildcardPermissionObj.permissions.includes(permission) ||
        wildcardPermissionObj.permissions.includes(CommonPermissions.MANAGE))
    )
      return true;

    const permissionObj = role.permissions.find((p) => {
      return p.subject == subject;
    });

    if (
      permissionObj &&
      (permissionObj.permissions.includes(permission) ||
        permissionObj.permissions.includes(CommonPermissions.MANAGE))
    )
      return true;

    return false;
  }
}
