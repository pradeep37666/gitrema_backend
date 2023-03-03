import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { User, UserSchema } from './schemas/users.schema';
import { Role, RoleSchema } from 'src/role/schemas/roles.schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/core/Constants/auth.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: jwtConstants.secret,
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
