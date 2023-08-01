import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { appContext } from 'src/core/Helpers/app-context';
import { IS_PUBLIC_KEY } from 'src/core/decorators/public.decorator';
import { LogPayloadService } from 'src/log-payload/log-payload.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly logPayloadService: LogPayloadService,
  ) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    appContext.request = request;

    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    appContext.request.user = user;
    // this.logPayloadService.create(appContext.request, {
    //   query: appContext.request.query,
    //   body: appContext.request.body,
    //   url: appContext.request.url,
    // });
    return user;
  }
}
