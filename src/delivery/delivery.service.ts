import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { OrderDocument } from 'src/order/schemas/order.schema';
import { YallowService } from 'src/core/Providers/delivery-aggregator/yallow.service';
import { InjectModel } from '@nestjs/mongoose';
import { Delivery, DeliveryDocument } from './schemas/delivery.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { AddOrder } from 'src/core/Providers/delivery-aggregator/interface/add-order.interface';
import { QueryDeliveryDto } from './dto/query-delivery.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(Delivery.name) private deliveryModel: Model<DeliveryDocument>,
    @InjectModel(Delivery.name)
    private deliveryModelPag: PaginateModel<DeliveryDocument>,
    private readonly yallowService: YallowService,
  ) {}
  async create(order: OrderDocument) {
    await order.populate([
      { path: 'supplierId' },
      { path: 'restaurantId' },
      { path: 'customerId' },
    ]);
    if (
      order.deliveryAddress?.latitude &&
      order.deliveryAddress?.longitude &&
      order.restaurantId?.location?.latitude &&
      order.restaurantId?.location?.longitude
    ) {
      const payload: AddOrder = {
        //pickup_id: order.restaurantId?.pickupId,
        // pickup_lat: order.restaurantId.location.latitude,
        // pickup_lng: order.restaurantId.location.longitude,
        lat: order.deliveryAddress.latitude,
        lng: order.deliveryAddress.longitude,
        preparation_time: order.preparationDetails.preparationTime,
        customer_name: order.name ?? order.customerId?.name,
        customer_phone: order.contactNumber ?? order.customerId?.phoneNumber,
        client_order_id: order._id.toString(),
        ingr_shop_id: order.supplierId?._id.toString(),
        ingr_shop_name: order.supplierId?.name,
        ingr_branch_id: order.restaurantId?._id.toString(),
        ingr_branch_name: order.restaurantId?.name,
        ingr_branch_lat: order.restaurantId?.location.latitude,
        ingr_branch_lng: order.restaurantId?.location.longitude,
        ingr_branch_phone: order.restaurantId?.whatsappNumber,
        Ingr_logo: order.supplierId?.logo,
      };
      const response = await this.yallowService.addOrder(payload);
      await this.deliveryModel.create({
        supplierId: order.supplierId,
        restaurantId: order.restaurantId._id,
        orderId: order._id,
        daResponse: response,
      });
    }
  }

  async cancel(orderId: string) {
    const delivery = await this.deliveryModel.findOne({
      orderId,
    });
    if (delivery && delivery.daResponse?.status) {
      const response = await this.yallowService.cancelOrder(
        delivery.daResponse.response.order_id,
      );
      console.log('Cancel Order Res ########', response);
    }
  }

  async refresh(orderId: string): Promise<DeliveryDocument> {
    const delivery = await this.deliveryModel.findOne({
      orderId,
    });
    if (delivery && delivery.daResponse?.status) {
      const response = await this.yallowService.getOrder(
        delivery.daResponse.response.order_id,
      );
      if (response.status) {
        delivery.daResponse.response = response.response;
        delivery.save();
        return delivery;
      }
      console.log(response.error);
      throw new BadRequestException(
        `Delivery fetch failed:${response?.error?.message}`,
      );
    }
    throw new BadRequestException(`Delivery not found`);
  }

  async findOne(orderId): Promise<DeliveryDocument> {
    const delivery = await this.deliveryModel.findOne({
      orderId,
    });

    return delivery;
  }

  async updateHook(dto: any) {
    const delivery = await this.deliveryModel.findOne({
      'daResponse.response.order_id': dto.order_id,
    });
    if (delivery) {
      delivery.daResponse = { ...delivery.daResponse, ...dto };
      delivery.save();
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} delivery`;
  // }

  // update(id: number, updateDeliveryDto: UpdateDeliveryDto) {
  //   return `This action updates a #${id} delivery`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} delivery`;
  // }
}
