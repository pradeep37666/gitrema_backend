import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { TokenStub } from './stubs/request.stub';
import {
  OrderCreateWithAdditionStub,
  OrderCreateWithoutAdditionStub,
} from './stubs/order.stub';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { AllExceptionsFilter } from 'src/core/Filters/all-exception.filter';
import { ResponseInterceptor } from 'src/core/Interceptors/response.interceptor';
import { TableCreateStub } from './stubs/table.stub';
import { createLogger } from 'winston';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { MongoDB } from 'winston-mongodb';
import { CashierCreateStub } from './stubs/cashier.stub';
import { KithchenQueueCreateStub } from './stubs/kitchen-queue.stub';

let app: NestFastifyApplication;

beforeAll(async () => {
  const loggerInstance = createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike(process.env.APP_NAME, {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
    ],
  });
  const winstonLoggerInstance = WinstonModule.createLogger({
    instance: loggerInstance,
  });
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
    {
      logger: winstonLoggerInstance,
    },
  );
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapter, winstonLoggerInstance),
  );
  app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.init();

  await app.getHttpAdapter().getInstance().ready();
});

it('Create Table', async () => {
  const res = await request(app.getHttpServer())
    .post('/table')
    .set('Authorization', TokenStub().token)
    .send(TableCreateStub())
    .expect(HttpStatus.CREATED);

  console.log(res.text);

  return res;
});

it('Create Cashier', async () => {
  const res = await request(app.getHttpServer())
    .post('/cashier')
    .set('Authorization', TokenStub().token)
    .send(CashierCreateStub())
    .expect(HttpStatus.CREATED);

  console.log(res.text);

  return res;
});

it('Create Kitchen Queue', async () => {
  const res = await request(app.getHttpServer())
    .post('/kitchen-queue')
    .set('Authorization', TokenStub().token)
    .send(KithchenQueueCreateStub())
    .expect(HttpStatus.CREATED);

  console.log(res.text);

  return res;
});

it('Create Order Without Additions', async () => {
  const res = await request(app.getHttpServer())
    .post('/order')
    .set('Authorization', TokenStub().token)
    .send(OrderCreateWithoutAdditionStub())
    .expect(HttpStatus.CREATED);

  console.log(res.text);

  return res;
});

it('Create Order With Additions', async () => {
  const res = await request(app.getHttpServer())
    .post('/order')
    .set('Authorization', TokenStub().token)
    .send(OrderCreateWithAdditionStub())
    .expect(HttpStatus.CREATED);

  console.log(res.text);

  return res;
});

afterAll(async () => {
  await app.close();
});
