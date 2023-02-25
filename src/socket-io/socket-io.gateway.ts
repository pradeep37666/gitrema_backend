import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketIoService } from './socket-io.service';
import { Http } from 'winston/lib/winston/transports';
import { HttpStatus, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt-auth.guard';
import { Role, RoleDocument } from 'src/role/schemas/roles.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocketEvents } from './enum/events.enum';

@WebSocketGateway({ cors: true })
@UseGuards(WsJwtGuard)
export class SocketIoGateway {
  constructor(
    private readonly socketIoService: SocketIoService,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('connected - ' + client.id);
    if (client?.handshake?.query?.supplierId) {
      client.join(client.handshake.query.supplierId);
      client.data.supplierId = client.handshake.query.supplierId;
    }
  }

  @SubscribeMessage(SocketEvents.ping)
  async ping(@ConnectedSocket() client: Socket, @MessageBody() dto: any) {
    await this.emit(client.data.supplierId, SocketEvents.ping, 'Pong');
  }

  async emit(supplierId: string, event: SocketEvents, data: any) {
    const roles = await this.roleModel.find({ events: event });
    for (const i in roles) {
      this.server.to(`${supplierId}_${roles[i]._id}`).emit(event, data);
    }
  }
}
