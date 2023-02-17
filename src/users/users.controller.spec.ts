import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';

import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from './schemas/users.schema';
import { UserService } from './users.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { UserCreateStub } from 'test/stubs/users.stub';
import { RequestStub } from 'test/stubs/request.stub';
import { PaginationStub } from 'test/stubs/pagination.stub';
import { Role, RoleSchema } from 'src/role/schemas/roles.schema';
import { PaginateResult } from 'mongoose';

describe('UsersController', () => {
  let controller: UserController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let roleModel: Model<Role>;
  let id = null;
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    roleModel = mongoConnection.model(Role.name, RoleSchema);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Role.name), useValue: roleModel },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create', async () => {
    const user = await controller.create(RequestStub(), UserCreateStub());
    expect(user._id).toBeDefined();
    id = user._id;
  });
  it('all', async () => {
    const users = await controller.all(RequestStub(), PaginationStub());
    expect(users).toBeDefined();
  });

  it('fetch', async () => {
    const user = await controller.fetch(id);
    expect(user.name).toBe(UserCreateStub().name);
  });
  it('update', async () => {
    const user = await controller.update(id, { name: 'Manish' });
    expect(user.name).toBe('Manish');
  });
  it('remove', async () => {
    const user = await controller.delete(id);
    expect(user).toMatchObject({
      message: 'Record deleted successfully',
      type: 'DELETED',
    });
  });

  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });
});
