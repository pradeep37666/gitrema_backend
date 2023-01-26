import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModelPag: PaginateModel<RestaurantDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateRestaurantDto,
  ): Promise<RestaurantDocument> {
    return await this.restaurantModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<RestaurantDocument>> {
    const restaurants = await this.restaurantModelPag.paginate(
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
    return restaurants;
  }

  async findOne(restaurantId: string): Promise<RestaurantDocument> {
    const exists = await this.restaurantModel.findById(restaurantId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    restaurantId: string,
    dto: UpdateRestaurantDto,
  ): Promise<RestaurantDocument> {
    const restaurant = await this.restaurantModel.findByIdAndUpdate(
      restaurantId,
      dto,
      { new: true },
    );

    if (!restaurant) {
      throw new NotFoundException();
    }

    return restaurant;
  }

  async remove(restaurantId: string): Promise<boolean> {
    const restaurant = await this.restaurantModel.findByIdAndUpdate(
      restaurantId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!restaurant) {
      throw new NotFoundException();
    }
    return true;
  }
}
