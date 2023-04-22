import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { LeanDocument, Model, PaginateModel, PaginateResult } from 'mongoose';
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

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Customer.name)
    private customerModelPag: PaginateModel<CustomerDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async create(req: any, dto: CreateCustomerDto): Promise<CustomerDocument> {
    const exists = await this.findByPhoneNumber(dto.phoneNumber);
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
  ): Promise<PaginateResult<CustomerDocument>> {
    const customers = await this.customerModelPag.paginate(
      {
        ...query,
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
  ): Promise<LeanDocument<CustomerDocument>> {
    const user = await this.customerModel.findOne({ phoneNumber }).lean();

    return user;
  }
}
