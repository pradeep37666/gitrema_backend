import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List, ListDocument } from './schemas/list.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name)
    private readonly listModel: Model<ListDocument>,
    @InjectModel(List.name)
    private readonly listModelPag: PaginateModel<ListDocument>,
  ) {}

  async create(req: any, dto: CreateListDto): Promise<ListDocument> {
    return await this.listModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ListDocument>> {
    const lists = await this.listModelPag.paginate(
      {
        supplierId: req.user.supplierId,
        deletedAt: null,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return lists;
  }

  async findOne(listId: string): Promise<ListDocument> {
    const exists = await this.listModel.findById(listId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(listId: string, dto: UpdateListDto): Promise<ListDocument> {
    const list = await this.listModel.findByIdAndUpdate(listId, dto, {
      new: true,
    });

    if (!list) {
      throw new NotFoundException();
    }

    return list;
  }

  async remove(listId: string): Promise<boolean> {
    const list = await this.listModel.findByIdAndUpdate(
      listId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!list) {
      throw new NotFoundException();
    }
    return true;
  }
}
