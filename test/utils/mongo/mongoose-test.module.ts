import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model, disconnect } from 'mongoose';

let mongod: MongoMemoryServer;
let mongoConnection: Connection;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      mongoConnection = (await connect(uri)).connection;
      return {
        uri,
        useCreateIndex: true,
        ...options,
      };
    },
  });

export const closeMongoConnection = async () => {
  await disconnect();
  if (mongod) await mongod.stop();
};
