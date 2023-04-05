import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { PermissionActions } from 'src/core/Constants/permission.type';
import {
  CommonPermissions,
  PermissionSubject,
} from 'src/core/Constants/permissions/permissions.enum';
import { Role, RoleDocument } from 'src/role/schemas/roles.schema';
import {
  SupplierPackage,
  SupplierPackageDocument,
} from 'src/supplier/schemas/supplier-package.schema';
import * as moment from 'moment';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>, //private cacheService: CacheService,
    @InjectModel(SupplierPackage.name)
    private supplierPackageModel: Model<SupplierPackageDocument>,
  ) {}
  async supplierHasPermission(
    user: any, // set the type of logged in user dto
    subject: PermissionSubject,
    permission: PermissionActions,
  ) {
    if (user.supplierId) {
      const supplierPackage = await this.supplierPackageModel
        .findOne({
          supplierId: user.supplierId,
          active: true,
        })
        .populate([{ path: 'features' }]);

      if (!supplierPackage) {
        throw new BadRequestException(
          'No active subscription! Please contact administrator',
        );
      }
      const checkIfTrialActive = supplierPackage.trialPeriodExpiryDate
        ? moment
            .utc(supplierPackage.trialPeriodExpiryDate)
            .isAfter(moment.utc())
        : false;
      const checkIfSubscriptionActive =
        supplierPackage.subscriptionExpiryDateWithGrace
          ? moment
              .utc(supplierPackage.subscriptionExpiryDateWithGrace)
              .isAfter(moment.utc())
          : false;
      if (!checkIfTrialActive && !checkIfSubscriptionActive) {
        throw new BadRequestException(
          'Subscription is expired! Please contact administrator',
        );
      }
      const permissions = supplierPackage.features
        .map((sp) => sp.permissions)
        .flat();
      const isPackageAllowed = this.checkPermission(
        permissions,
        subject,
        permission,
      );
      if (!isPackageAllowed) {
        throw new BadRequestException(
          'Action not allowed for the subscribed package',
        );
      }
    }
    return true;
  }
  async userHasPermission(
    user: any, // set the type of logged in user dto
    subject: PermissionSubject,
    permission: PermissionActions,
  ) {
    const role = await this.roleModel.findById(user.roleId).lean();
    console.log(role, subject, permission);
    if (!role) return false;

    return this.checkPermission(role.permissions, subject, permission);
  }

  checkPermission(
    permissions,
    subject: PermissionSubject,
    permission: PermissionActions,
  ) {
    const wildcardPermissions = permissions.filter((p) => {
      return p.subject == PermissionSubject.ALL;
    });

    for (const i in wildcardPermissions) {
      if (
        wildcardPermissions[i].permissions.includes(permission) ||
        wildcardPermissions[i].permissions.includes(CommonPermissions.MANAGE)
      )
        return true;
    }

    const permissionObjs = permissions.filter((p) => {
      return p.subject == subject;
    });

    for (const i in permissionObjs) {
      if (
        permissionObjs[i].permissions.includes(permission) ||
        permissionObjs[i].permissions.includes(CommonPermissions.MANAGE)
      )
        return true;
    }

    return false;
  }
}
