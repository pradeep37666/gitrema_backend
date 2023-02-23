import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketIoService } from './socket-io.service';

@WebSocketGateway({ cors: true })
export class SocketIoGateway {
  constructor(private readonly socketIoService: SocketIoService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('connected - ' + client.id);

    client.to(client.id).emit('TalabatMenu', 'Connected');
  }
}
