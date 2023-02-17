import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, PaginateModel, PaginateResult } from 'mongoose';
import { UserUpdateDto } from './users.dto';

import { User, UserDocument } from './schemas/users.schema';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import { generateRandomPassword } from 'src/core/Helpers/universal.helper';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(User.name) private userModelPag: PaginateModel<UserDocument>,
  ) {}

  async create(req: any, userRequest: any): Promise<UserDocument> {
    const userExists = await this.findByEmail(userRequest.email);
    if (userExists) {
      throw new BadRequestException(STATUS_MSG.ERROR.EMAIL_EXISTS);
    }
    let userDetails: any = userRequest;
    if (req) {
      userDetails = {
        ...userDetails,
        supplierId: req.user.supplierId,
        addedBy: req.user ? req.user.userId : null,
      };
    }
    if (!userDetails.password) {
      userDetails.password = generateRandomPassword();
    }

    const user = await new this.userModel(userDetails);
    this.postUserCreate(user);
    return await user.save();
  }

  async postUserCreate(user: UserDocument) {
    await this.userModel.updateMany(
      {
        supplierId: user.supplierId,
        _id: { $ne: user._id },
      },
      {
        $set: {
          isDefaultWaiter: false,
        },
      },
    );
  }

  async update(
    userId: string,
    userDetailes: UserUpdateDto,
  ): Promise<LeanDocument<User>> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, userDetailes, {
        new: true,
        projection: { password: 0 },
      })
      .lean();
    if (!user) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    return user;
  }

  async all(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<UserDocument>> {
    const users = await this.userModelPag.paginate(
      {
        supplierId: req.user.supplierId,
      },
      {
        projection: { password: 0 },
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          {
            path: 'role',
          },
        ],
      },
    );

    return users;
  }

  async fetch(userId: string): Promise<LeanDocument<User>> {
    const user = await this.userModel.findById(userId, { password: 0 }).lean();
    if (!user) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }

    return user;
  }

  async delete(userId: string): Promise<LeanDocument<User>> {
    const user = await this.userModel.findByIdAndDelete(userId).lean();
    if (!user) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    return user;
  }

  async findByEmail(email: string): Promise<LeanDocument<UserDocument>> {
    const user = await this.userModel.findOne({ email: email }).lean();

    return user;
  }

  async findAdmin(): Promise<LeanDocument<User[]>> {
    return this.userModel.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $match: { 'role.slug': 'Admin' },
      },
    ]);
  }
}
