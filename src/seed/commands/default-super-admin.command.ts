// import { Command, Positional, Option } from 'nestjs-command';
// import { Injectable } from '@nestjs/common';

// import { Model } from 'mongoose';
// import { InjectModel } from '@nestjs/mongoose';
// import { User, UserDocument } from 'src/users/schemas/users.schema';

// @Injectable()
// export class DefaultSuperAdminCommand {
//   constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

//   @Command({
//     command: 'create:super-admin',
//     describe: 'create a user',
//   })
//   async createDefaultSuperAdminUser() {
//     // password: string, // }) //   type: 'string', //   describe: 'The name of user', //   name: 'password', // @Positional({ // email: string, // }) //   type: 'string', //   describe: 'The email of user', //   name: 'email', // @Positional({ // name: string, // }) //   type: 'string', //   describe: 'The name of user', //   name: 'name', // @Positional({
//     console.log('Test');
//     //await this.userModel.create({ name, email, password });
//   }
// }
