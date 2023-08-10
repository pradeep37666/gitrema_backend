import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import mongoose, {
  AggregatePaginateModel,
  LeanDocument,
  Model,
  PaginateModel,
  PaginateResult,
} from 'mongoose';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { RoleSlug } from 'src/core/Constants/enum';
import { Role, RoleDocument } from 'src/role/schemas/roles.schema';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { Types } from 'mongoose';
import ObjectId from 'mongoose';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Customer.name)
    private customerModelPag: PaginateModel<CustomerDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Order.name)
    private orderModelPag: AggregatePaginateModel<OrderDocument>,
  ) {}

  async create(req: any, dto: CreateCustomerDto): Promise<CustomerDocument> {
    const exists = await this.findByPhoneNumber(
      dto.phoneNumber,
      req.user.supplierId,
    );
    if (exists) {
      throw new BadRequestException(VALIDATION_MESSAGES.CustomerExist.key);
    }
    const customerRole = await this.roleModel.findOne({
      slug: RoleSlug.Customer,
    });
    if (!customerRole)
      throw new BadRequestException(VALIDATION_MESSAGES.RoleNotFound.key);

    const customer = await this.customerModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      role: customerRole._id,
    });

    return customer;
  }

  async update(
    customerId: string,
    dto: UpdateCustomerDto,
  ): Promise<LeanDocument<CustomerDocument>> {
    const customer = await this.customerModel
      .findByIdAndUpdate(customerId, dto, {
        new: true,
      })
      .lean();
    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }
    return customer;
  }

  async findAll(
    req: any,
    query: QueryCustomerDto,
    paginateOptions: PaginationDto,
  ): Promise<any> {
    const queryObj: any = { ...query };

    if (query.search) {
      queryObj.$or = [{ name: { $regex: query.search, $options: 'i' } }];
    }
    // const customers = await this.orderModelPag.aggregatePaginate(
    //   this.orderModelPag.aggregate([
    //     {
    //       $match: {
    //         supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: 'customers',
    //         let: {
    //           customerId: '$customerId',
    //         },
    //         pipeline: [
    //           {
    //             $match: {
    //               $expr: {
    //                 $eq: ['$_id', '$$customerId'],
    //               },
    //               ...queryObj,
    //             },
    //           },
    //         ],
    //         as: 'customers',
    //       },
    //     },
    //     {
    //       $match: {
    //         customers: { $ne: [] },
    //       },
    //     },

    //     {
    //       $group: {
    //         _id: '$customerId',
    //         name: { $first: '$customers.name' },
    //         email: { $first: '$customers.email' },
    //         role: { $first: '$customers.role' },
    //         phoneNumber: { $first: '$customers.phoneNumber' },
    //         deliveryAddress: { $first: '$customers.deliveryAddress' },
    //       },
    //     },
    //   ]),
    //   {
    //     sort: paginateOptions.sortBy
    //       ? {
    //           [paginateOptions.sortBy]: paginateOptions.sortDirection
    //             ? paginateOptions.sortDirection
    //             : -1,
    //         }
    //       : DefaultSort,
    //     lean: true,
    //     ...paginateOptions,
    //     ...pagination,
    //   },
    // );
    const customers = await this.customerModelPag.paginate(
      {
        ...queryObj,
        supplierId: req.user.supplierId,
        isBlocked: false,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );

    return customers;
  }

  async findOne(customerId: string): Promise<LeanDocument<CustomerDocument>> {
    const customer = await this.customerModel.findById(customerId).lean();
    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }

    return customer;
  }

  async remove(customerId: string): Promise<LeanDocument<CustomerDocument>> {
    const user = await this.customerModel.findByIdAndDelete(customerId).lean();
    if (!user) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    return user;
  }

  async findByPhoneNumber(
    phoneNumber: string,
    supplierId,
  ): Promise<LeanDocument<CustomerDocument>> {
    const user = await this.customerModel
      .findOne({ phoneNumber, supplierId })
      .lean();

    return user;
  }
}
