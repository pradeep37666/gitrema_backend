import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, PaginateModel, PaginateResult } from 'mongoose';
import { Role, RoleDocument } from './schemas/roles.schema';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { RoleCreateDto, RoleUpdateDto } from './role.dto';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { SubjectsRestrictedForSupplier } from 'src/core/Constants/permissions/permissions.enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Role.name)
    private roleModelPag: PaginateModel<RoleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>, // private cacheService: CacheService,
  ) {}

  async create(req: any, roleDetails: RoleCreateDto): Promise<RoleDocument> {
    if (req.user.supplierId) {
      delete roleDetails.slug;
      const subjects: any = roleDetails.permissions.map((p) => p.subject);
      if (
        subjects.some(
          (r) => Object.values(SubjectsRestrictedForSupplier).indexOf(r) >= 0,
        )
      ) {
        throw new BadRequestException(
          `${Object.values(SubjectsRestrictedForSupplier).join(
            ',',
          )} are not allowed for supplier`,
        );
      }
    }
    const role = new this.roleModel({
      ...roleDetails,
      supplierId: req.user.supplierId ?? null,
      addedBy: req.user.userId,
    });
    await role.save();

    return role;
  }

  async update(
    req,
    roleId: string,
    roleDetails: RoleUpdateDto,
  ): Promise<LeanDocument<RoleDocument>> {
    if (req.user.supplierId) {
      delete roleDetails.slug;
      const subjects: any = roleDetails.permissions.map((p) => p.subject);
      if (
        subjects.some(
          (r) => Object.values(SubjectsRestrictedForSupplier).indexOf(r) >= 0,
        )
      ) {
        throw new BadRequestException(
          `${Object.values(SubjectsRestrictedForSupplier).join(
            ',',
          )} are not allowed for supplier`,
        );
      }
    }
    const role = await this.roleModel
      .findByIdAndUpdate(roleId, roleDetails, {
        new: true,
      })
      .lean();

    if (!role) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    // refresh the role in cache
    //this.cacheService.set(role.id, role);
    return role;
  }

  async all(
    req: any,

    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<RoleDocument>> {
    const query: any = {};
    if (req.supplierId) {
      query.supplierId = req.supplierId;
    }

    const roles = await this.roleModelPag.paginate(query, {
      sort: DefaultSort,
      lean: true,
      ...paginateOptions,
      ...pagination,
      populate: [{ path: 'screenDisplays' }],
    });
    return roles;
  }

  async fetch(roleId: string): Promise<LeanDocument<RoleDocument>> {
    const role = await this.roleModel
      .findOne({ _id: roleId })
      .populate([{ path: 'screenDisplays' }])
      .lean();
    if (!role) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    return role;
  }

  async delete(roleId: string): Promise<LeanDocument<RoleDocument>> {
    const usersHavingRole = await this.userModel.count({ role: roleId });
    if (usersHavingRole > 0)
      throw new BadRequestException(STATUS_MSG.ERROR.CAN_NOT_BE_DELETED);
    const role = await this.roleModel.findByIdAndDelete(roleId);

    if (!role) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    return role;
  }
}
