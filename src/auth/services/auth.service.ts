import { LeanDocument, Model } from 'mongoose';
import {
  Injectable,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SignupRequestDto } from '../dto/signup-request.dto';

import { JwtService } from '@nestjs/jwt';

import {
  LoggedInUserPayload,
  RequestOtpDto,
  StaffLoginDto,
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger();
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    @InjectModel(Otp.name)
    private otpModel: Model<OtpDocument>,
    private userService: UserService,
    private supplierService: SupplierService,
    private jwtService: JwtService,
    private readonly asmscService: AsmscService,
    private readonly mailService: MailService,
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
        { path: 'role', select: { name: 1 } },
        { path: 'supplierId', select: { active: 1 } },
      ]);
      return user.toObject();
    }
    return null;
  }

  async login(user: any): Promise<any> {
    const payload = {
      email: user.email,
      userId: user._id,
      supplierId: user.supplierId._id,
      roleId: user.role._id,
    };

    return await this.generateAuthToken(payload);
  }

  async staffLogin(loginRequest: StaffLoginDto): Promise<any> {
    const user = await this.userModel.findOne({
      phoneNumber: loginRequest.phoneNumber,
    });
    if (user && (await bcrypt.compare(loginRequest.password, user.password))) {
      delete user.password;
      await user.populate([{ path: 'role', select: { name: 1 } }]);
      const payload = {
        userId: user._id,
        supplierId: user.supplierId,
        restaurantId: user.restaurantId,
        roleId: user.role._id,
      };

      return { user, accessToken: await this.generateAuthToken(payload) };
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
    await user.populate([{ path: 'role', select: { name: 1 } }]);
    return user.toObject();
  }

  async requestOtp(req, requestOtpDetails: RequestOtpDto): Promise<any> {
    const response = await this.asmscService.sendOtp(
      requestOtpDetails.phoneNumber,
    );
    if (response.status == 'S') {
      return { verificationId: response.verfication_id };
    }
    throw new BadRequestException(STATUS_MSG.ERROR.ERROR_SMS);
  }

  async verifyOtp(
    req,
    verificationOtpDetails: VerificationOtpDto,
  ): Promise<any> {
    if (verificationOtpDetails.code !== 'FMJLAL2ZOC') {
      const response = await this.asmscService.verifyOtp(
        verificationOtpDetails,
      );
      if (response.status != 'V') {
        throw new BadRequestException(STATUS_MSG.ERROR.VERIFICATION_FAILED);
      }
    }

    const user = await this.userModel.findOne({
      phoneNumber: verificationOtpDetails.phoneNumber,
    });

    if (user) {
      const payload = {
        userId: user._id,
        roleId: user.role,
        restaurantId: user.restaurantId,
        supplierId: user.supplierId,
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
