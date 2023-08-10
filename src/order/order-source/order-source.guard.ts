
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { OrderSourceService } from './order-source.service';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';

@Injectable()
export class OrderSourceValidationGuard implements CanActivate {
    ROLE_FEEDUS = 'Feedus';
    constructor(
        private readonly orderSourceService: OrderSourceService,
      ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const  user = request.user;
         const body = request.body;
        const isvalid =   await this.orderSourceService.validateOrder(user,body);
        if(!isvalid){
            throw new UnauthorizedException({
                ...STATUS_MSG.ERROR.FORBIDDEN,
                message:
                  'You are forbidden to access this api'
              });

        }
        return  isvalid
    }
}