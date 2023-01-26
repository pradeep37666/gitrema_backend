import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { BasicCommand } from './commands/basic.command';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [BasicCommand],
})
export class SeedModule {}
