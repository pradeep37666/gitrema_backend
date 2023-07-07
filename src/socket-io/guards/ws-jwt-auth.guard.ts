import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketIoGateway } from '../socket-io.gateway';
import { SocketEvents } from '../enum/events.enum';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => SocketIoGateway))
    private socketGateway: SocketIoGateway,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();

    try {
      const authTokenArr = client.handshake?.headers?.authorization?.split(' ');
      console.log(authTokenArr);
      if (authTokenArr.length != 2) {
        this.socketGateway.emit(client.id, SocketEvents.auth, false, client.id);
        client.disconnect();

        throw new WsException(`Invalid Token`);
      }
      const authToken: string = authTokenArr[1];
      const payload: any = await this.jwtService.decode(authToken);
      console.log(payload);
      if (payload.userId) {
        this.socketGateway.emit(client.id, SocketEvents.auth, true, client.id);
        context.switchToHttp().getRequest().user = payload;
        client.data.user = payload;
        if (payload.supplierId && payload.roleId) {
          client.join(`${payload.supplierId}_${payload.roleId}`);
        }

        return true;
      }
      return false;
    } catch (err) {
      this.socketGateway.emit(client.id, SocketEvents.auth, false, client.id);
      client.disconnect();
      throw new WsException(`Auth Unsuccessfull`);
    }
  }
}
