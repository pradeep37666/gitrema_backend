import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from 'src/admin/schemas/admin.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
    @InjectModel(Admin.name)
    private readonly adminModelPag: PaginateModel<AdminDocument>,
  ) {}

  async create(req: any, dto: CreateAdminDto): Promise<AdminDocument> {
    return await this.adminModel.create({
      ...dto,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<AdminDocument>> {
    const admins = await this.adminModelPag.paginate(
      {
        deletedAt: null,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return admins;
  }

  async findOne(adminId: string): Promise<AdminDocument> {
    const exists = await this.adminModel.findById(adminId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    req: any,
    adminId: string,
    dto: UpdateAdminDto,
  ): Promise<AdminDocument> {
    const admin = await this.adminModel.findByIdAndUpdate(adminId, dto, {
      new: true,
    });

    if (!admin) {
      throw new NotFoundException();
    }

    return admin;
  }

  async remove(adminId: string): Promise<boolean> {
    const admin = await this.adminModel.findByIdAndUpdate(
      adminId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!admin) {
      throw new NotFoundException();
    }
    return true;
  }
}
