import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer, OfferDocument } from './schemas/offer.schema';
import { QueryOfferDto } from './dto/query-offer.dto';

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    @InjectModel(Offer.name)
    private readonly offerModelPag: PaginateModel<OfferDocument>,
  ) {}

  async create(req: any, dto: CreateOfferDto): Promise<OfferDocument> {
    return await this.offerModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    query: QueryOfferDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<OfferDocument>> {
    const offers = await this.offerModelPag.paginate(
      {
        ...query,
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
    return offers;
  }

  async findOne(offerId: string): Promise<OfferDocument> {
    const exists = await this.offerModel.findById(offerId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(offerId: string, dto: UpdateOfferDto): Promise<OfferDocument> {
    const offer = await this.offerModel.findByIdAndUpdate(offerId, dto, {
      new: true,
    });

    if (!offer) {
      throw new NotFoundException();
    }

    return offer;
  }

  async remove(offerId: string): Promise<boolean> {
    const offer = await this.offerModel.findByIdAndUpdate(
      offerId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!offer) {
      throw new NotFoundException();
    }
    return true;
  }
}
