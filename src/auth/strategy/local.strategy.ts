import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException(VALIDATION_MESSAGES.Unauthorised.key);
    }
    if (user.supplierId && user.supplierId.active == false) {
      throw new BadRequestException(VALIDATION_MESSAGES.SupplierInactive.key);
    }
    return user;
  }
}
