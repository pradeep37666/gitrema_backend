import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, PaginateModel, PaginateResult } from 'mongoose';
import { Role, RoleDocument } from './schemas/roles.schema';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { RoleCreateDto } from './role.dto';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Role.name)
    private roleModelPag: PaginateModel<RoleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>, // private cacheService: CacheService,
  ) {}

  async create(req: any, roleDetails: RoleCreateDto): Promise<RoleDocument> {
    const role = new this.roleModel({
      ...roleDetails,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
    await role.save();

    return role;
  }

  async update(
    roleId: string,
    roleDetails: RoleCreateDto,
  ): Promise<LeanDocument<RoleDocument>> {
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
    });
    return roles;
  }

  async fetch(roleId: string): Promise<LeanDocument<RoleDocument>> {
    const role = await this.roleModel.findOne({ _id: roleId }).lean();
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
