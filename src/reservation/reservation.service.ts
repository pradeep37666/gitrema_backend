import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { QueryReservationDto } from './dto/query-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(Reservation.name)
    private readonly reservationModelPag: PaginateModel<ReservationDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateReservationDto,
  ): Promise<ReservationDocument> {
    return await this.reservationModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    query: QueryReservationDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ReservationDocument>> {
    const reservations = await this.reservationModelPag.paginate(
      {
        supplierId: req.user.supplierId,
        ...query,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          { path: 'restaurantId', select: { name: 1, nameAr: 1 } },
          { path: 'customerId', select: { name: 1 } },
          { path: 'tableRegion', select: { name: 1, nameAr: 1 } },
        ],
      },
    );
    return reservations;
  }

  async findOne(reservationId: string): Promise<ReservationDocument> {
    const exists = await this.reservationModel
      .findById(reservationId)
      .populate([
        { path: 'restaurantId', select: { name: 1, nameAr: 1 } },
        { path: 'customerId', select: { name: 1 } },
        { path: 'tableRegion', select: { name: 1, nameAr: 1 } },
      ]);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    reservationId: string,
    dto: UpdateReservationDto,
  ): Promise<ReservationDocument> {
    const reservation = await this.reservationModel.findByIdAndUpdate(
      reservationId,
      dto,
      {
        new: true,
      },
    );

    if (!reservation) {
      throw new NotFoundException();
    }

    return reservation;
  }

  async remove(reservationId: string): Promise<boolean> {
    const reservation = await this.reservationModel.findByIdAndUpdate(
      reservationId,
      { isCancelled: true },
    );

    if (!reservation) {
      throw new NotFoundException();
    }
    return true;
  }
}
