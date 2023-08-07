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
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Supplier.name)
    private supplierModel: Model<SupplierDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(SupplierPackage.name)
    private supplierPackageModel: Model<SupplierPackageDocument>,
    private readonly cacheService: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: LoggedInUserPayload) {
    if (payload.supplierId) {
      if (payload.userId && !payload.isCustomer) {
        let user = await this.cacheService.get(payload.userId);
        if (!user) {
          user = await this.userModel.findOne({
            _id: payload.userId,
          });
          if (user) {
            await this.cacheService.set(payload.userId, user.toObject());
          }
        }

        if (!user || user.isBlocked) {
          throw new UnauthorizedException(`Token is expired`);
        }
      }
      let supplier = await this.cacheService.get(payload.supplierId);
      if (!supplier) {
        supplier = await this.supplierModel.findOne({
          _id: payload.supplierId,
        });
        if (supplier)
          await this.cacheService.set(payload.supplierId, supplier.toObject());
      }

      if (!supplier || !supplier.active) {
        throw new BadRequestException(VALIDATION_MESSAGES.SupplierInactive.key);
      }
      if (payload.time) {
        const tokenStartDate = moment(payload.time).add(
          NO_AUTH_EXPIRE_MIN,
          'minutes',
        );
        const currentDate = moment();
        console.log(tokenStartDate, currentDate);
        if (currentDate.isAfter(tokenStartDate)) {
          throw new UnauthorizedException(`Token is expired`);
        }
      }
    }

    return payload;
  }
}
