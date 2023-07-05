import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from 'src/core/Constants/auth.constants';
import { LoggedInUserPayload } from '../dto/login-request.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';
import { Model } from 'mongoose';
import {
  SupplierPackage,
  SupplierPackageDocument,
} from 'src/supplier/schemas/supplier-package.schema';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import * as moment from 'moment';
import { NO_AUTH_EXPIRE_MIN } from 'src/core/Constants/system.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Supplier.name)
    private supplierModel: Model<SupplierDocument>,
    @InjectModel(SupplierPackage.name)
    private supplierPackageModel: Model<SupplierPackageDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: LoggedInUserPayload) {
    if (payload.supplierId) {
      const supplier = await this.supplierModel.findOne({
        _id: payload.supplierId,
        active: true,
      });
      if (!supplier) {
        throw new BadRequestException(VALIDATION_MESSAGES.SupplierInactive.key);
      }
      if (payload.time) {
        const tokenStartDate = moment(payload.time).add(
          NO_AUTH_EXPIRE_MIN,
          'minutes',
        );
        const currentDate = moment();
        if (currentDate.isAfter(tokenStartDate)) {
          throw new UnauthorizedException(`Token is expired`);
        }
      }
    }

    return payload;
  }
}
