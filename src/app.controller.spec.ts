import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import {
  closeMongoConnection,
  rootMongooseTestModule,
} from 'test/utils/mongo/mongoose-test.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/controllers/auth.controller';
import { AuthService } from './auth/services/auth.service';
//import { LoginDtoStub } from 'test/stubs/users/login-dto.stub';

describe('AppController', () => {
  let appController: AppController;

  beforeAll(async () => {
    rootMongooseTestModule();
    const app: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    appController = app.get<AppController>(AppController);
  });

  afterAll(async () => {
    closeMongoConnection();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
