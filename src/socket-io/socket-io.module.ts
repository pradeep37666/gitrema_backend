import { Module } from '@nestjs/common';
import { SocketIoService } from './socket-io.service';
import { SocketIoGateway } from './socket-io.gateway';
import { WsJwtGuard } from './guards/ws-jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/core/Constants/auth.constants';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/role/schemas/roles.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: jwtConstants.secret,
      }),
    }),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  providers: [SocketIoGateway, SocketIoService, WsJwtGuard],
  exports: [SocketIoGateway],
})
export class SocketIoModule {}
