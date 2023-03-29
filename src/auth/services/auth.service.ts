import { LeanDocument, Model } from 'mongoose';
import {
  Injectable,
  BadRequestException,
  Logger,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SignupRequestDto } from '../dto/signup-request.dto';

import { JwtService } from '@nestjs/jwt';

import {
  AdminLoginDto,
  LoggedInUserPayload,
  LoginRequestDto,
  RequestOtpDto,
  StaffLoginDto,
  UserVerificationOtpDto,
  VerificationOtpDto,
} from '../dto/login-request.dto';

import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { Role, RoleDocument } from 'src/role/schemas/roles.schema';
import { UserService } from 'src/users/users.service';
import { SupplierService } from 'src/supplier/Supplier.service';
import { AsmscService } from 'src/core/Providers/Sms/asmsc-sms.service';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import { AddSupplierDto } from 'src/supplier/Supplier.dto';
import { OtpStatus, RoleSlug } from 'src/core/Constants/enum';
import { Otp, OtpDocument } from '../schemas/otp.schema';
import { MailService } from 'src/notification/mail/mail.service';
import {
  Customer,
  CustomerDocument,
} from 'src/customer/schemas/customer.schema';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';
import { TaqnyatService } from 'src/core/Providers/Sms/taqnyat.service';
import { TestDataService } from 'src/test-data/test-data.service';
import { Admin, AdminDocument } from 'src/admin/schemas/admin.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger();
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Admin.name)
    private adminModel: Model<AdminDocument>,
    @InjectModel(Supplier.name)
    private supplierModel: Model<SupplierDocument>,
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    @InjectModel(Otp.name)
    private otpModel: Model<OtpDocument>,
    private userService: UserService,
    private supplierService: SupplierService,
    private jwtService: JwtService,
    private readonly asmscService: AsmscService,
    private readonly tanqyatService: TaqnyatService,
    private readonly mailService: MailService,
    private readonly testDataService: TestDataService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<LeanDocument<User>> {
    const user = await this.userModel.findOne({
      email,
    });
    await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      delete user.password;
      await user.populate([
        {
          path: 'role',
          select: { name: 1 },
          populate: [{ path: 'screenDisplays' }],
        },
        { path: 'supplierId', select: { active: 1, alias: 1 } },
      ]);
      return user.toObject();
    }
    return null;
  }

  async login(user: any, loginRequest: LoginRequestDto): Promise<any> {
    console.log(user);
    if (loginRequest.alias && loginRequest.alias != user.supplierId?.alias) {
      throw new BadRequestException(`Invalid alias`);
    }
    const payload = {
      email: user.email,
      userId: user._id,
      supplierId: user.supplierId?._id,
      roleId: user.role._id,
    };

    return await this.generateAuthToken(payload);
  }

  async staffLogin(loginRequest: StaffLoginDto): Promise<any> {
    const supplier = await this.supplierModel.findOne({
      alias: loginRequest.alias,
    });
    if (supplier) {
      const user = await this.userModel.findOne({
        phoneNumber: loginRequest.phoneNumber,
        supplierId: supplier._id,
      });
      if (
        user &&
        (await bcrypt.compare(loginRequest.password, user.password))
      ) {
        delete user.password;
        await user.populate([
          {
            path: 'role',
            select: { name: 1 },
            populate: [{ path: 'screenDisplays' }],
          },
        ]);
        const payload = {
          userId: user._id,
          supplierId: user.supplierId,
          restaurantId: user.restaurantId,
          roleId: user.role._id,
        };

        return { user, accessToken: await this.generateAuthToken(payload) };
      }
    }
    throw new UnauthorizedException();
  }

  async adminLogin(dto: AdminLoginDto): Promise<any> {
    const admin = await this.adminModel.findOne({
      email: dto.email,
    });
    if (admin && (await bcrypt.compare(dto.password, admin.password))) {
      delete admin.password;
      await admin.populate([
        {
          path: 'role',
          select: { name: 1 },
          populate: [{ path: 'screenDisplays' }],
        },
      ]);
      const payload = {
        userId: admin._id,

        roleId: admin.role._id,
      };

      return { admin, accessToken: await this.generateAuthToken(payload) };
    }
    throw new UnauthorizedException();
  }

  async signup(signupRequest: SignupRequestDto): Promise<UserDocument> {
    const userExists = await this.userService.findByEmail(signupRequest.email);
    if (userExists) {
      throw new BadRequestException(STATUS_MSG.ERROR.EMAIL_EXISTS);
    }
    const addSupplierReq: AddSupplierDto = {
      ...signupRequest.supplier,
    };
    const supplierDocument = await this.supplierService.createSupplier(
      null,
      addSupplierReq,
    );

    // const { supplier, ...result } = signupRequest;
    const { ...result } = signupRequest;
    const adminRole = await this.roleModel.findOne({
      slug: RoleSlug.SupplierAdmin,
    });
    const userCreateReq: any = {
      ...result,
      supplierId: supplierDocument._id,
      role: adminRole?._id,
    };

    const user = await this.userService.create(null, userCreateReq);
    if (user && signupRequest.supplier.createTestData) {
      this.testDataService.run(
        { user: { userId: user._id, supplierId: supplierDocument._id } },
        supplierDocument,
      );
    }
    await user.populate([
      {
        path: 'role',
        select: { name: 1 },
        populate: [{ path: 'screenDisplays' }],
      },
    ]);
    return user.toObject();
  }

  async requestOtp(req, requestOtpDetails: RequestOtpDto): Promise<any> {
    const code = Math.floor(1000 + Math.random() * 9000);
    const template = `Your verification code: ${code} for login Talabatmenu portal.`;
    await this.otpModel.updateMany(
      { phoneNumber: requestOtpDetails.phoneNumber },
      { status: OtpStatus.Used },
    );
    this.otpModel.create({ phoneNumber: requestOtpDetails.phoneNumber, code });

    const response = await this.tanqyatService.send(
      requestOtpDetails.phoneNumber,
      template,
    );
    console.log(response);
    if (response.statusCode == HttpStatus.CREATED)
      return { verificationId: response.messageId };
    // if (response.status == 'S') {
    //   return { verificationId: response.verfication_id };
    // }
    throw new BadRequestException(STATUS_MSG.ERROR.ERROR_SMS);
  }

  async verifyCustomerOtp(
    req,
    verificationOtpDetails: VerificationOtpDto,
  ): Promise<any> {
    if (verificationOtpDetails.code !== 'FMJLAL2ZOC') {
      // const response = await this.asmscService.verifyOtp(
      //   verificationOtpDetails,
      // );
      // if (response.status != 'V') {
      //   throw new BadRequestException(STATUS_MSG.ERROR.VERIFICATION_FAILED);
      // }
      const otp = await this.otpModel.findOne({
        status: OtpStatus.Pending,
        phoneNumber: verificationOtpDetails.phoneNumber,
        code: verificationOtpDetails.verificationCode,
      });
      if (!otp) {
        throw new BadRequestException(STATUS_MSG.ERROR.VERIFICATION_FAILED);
      }
      this.otpModel.updateMany(
        { phoneNumber: verificationOtpDetails.phoneNumber },
        { status: OtpStatus.Used },
      );
    }

    let customer = await this.customerModel.findOne({
      phoneNumber: verificationOtpDetails.phoneNumber,
    });

    if (!customer) {
      const customerRole = await this.roleModel.findOne({
        slug: RoleSlug.Customer,
      });
      if (!customerRole)
        throw new BadRequestException(
          `Role is not defined. Please contact admin`,
        );
      customer = await this.customerModel.create({
        phoneNumber: verificationOtpDetails.phoneNumber,
        role: customerRole._id,
      });
    }
    if (customer) {
      const payload = {
        userId: customer._id,
        roleId: customer.role,
        supplierId: verificationOtpDetails.supplierId,
        isCustomer: true,
      };
      await customer.populate([
        {
          path: 'role',
          select: { name: 1 },
          populate: [{ path: 'screenDisplays' }],
        },
      ]);
      return {
        accessToken: await this.generateAuthToken(payload),
        customer,
      };
    }
    throw new BadRequestException(STATUS_MSG.ERROR.SERVER_ERROR);
  }

  async verifyUserOtp(
    req,
    verificationOtpDetails: UserVerificationOtpDto,
  ): Promise<any> {
    if (verificationOtpDetails.code !== 'FMJLAL2ZOC') {
      // const response = await this.asmscService.verifyOtp(
      //   verificationOtpDetails,
      // );
      // if (response.status != 'V') {
      //   throw new BadRequestException(STATUS_MSG.ERROR.VERIFICATION_FAILED);
      // }
      const otp = await this.otpModel.findOne({
        status: OtpStatus.Pending,
        phoneNumber: verificationOtpDetails.phoneNumber,
        code: verificationOtpDetails.verificationCode,
      });
      if (!otp) {
        throw new BadRequestException(STATUS_MSG.ERROR.VERIFICATION_FAILED);
      }
      this.otpModel.updateMany(
        { phoneNumber: verificationOtpDetails.phoneNumber },
        { status: OtpStatus.Used },
      );
    }
    const supplier = await this.supplierModel.findOne({
      alias: verificationOtpDetails.alias,
    });
    if (!supplier) throw new BadRequestException(`Invalid alias`);
    const user = await this.userModel.findOne({
      phoneNumber: verificationOtpDetails.phoneNumber,
      supplierId: supplier._id,
    });

    if (!user) {
      throw new BadRequestException(`User is not registered yet`);
    }
    if (user) {
      const payload = {
        userId: user._id,
        roleId: user.role,
      };

      return {
        accessToken: await this.generateAuthToken(payload),
        user,
      };
    }
    throw new BadRequestException(STATUS_MSG.ERROR.SERVER_ERROR);
  }

  async getTokenToAccessPublicApis(domain: string): Promise<any> {
    const supplier = await this.supplierService.getByDomain(domain);
    if (!supplier) {
      throw new BadRequestException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    const role = await this.roleModel
      .findOne({ slug: RoleSlug.Visitor })
      .lean();
    if (!role) throw new BadRequestException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    const payload = {
      userId: '',
      supplierId: supplier._id,
      roleId: role._id,
    };

    return { accessToken: await this.generateAuthToken(payload), supplier };
  }

  async generateAuthToken(payload: LoggedInUserPayload) {
    return await this.jwtService.sign(payload);
  }
}
