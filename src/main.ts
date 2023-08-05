import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './core/Interceptors/response.interceptor';
import { AllExceptionsFilter } from './core/Filters/all-exception.filter';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { contentParser } from 'fastify-multer';
import { createLogger } from 'winston';
import * as winston from 'winston';
import { MongoDB } from 'winston-mongodb';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { SocketAdapter } from './core/adapters/socket.adapter';

declare const module: any;

async function bootstrap() {
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
      new MongoDB({
        db: process.env.MONGO_URL,
        dbName: process.env.DB_NAME,
        collection: process.env.LOG_CONTAINER_NAME,
        level: process.env.LOG_LEVEL,
        options: {
          useUnifiedTopology: true,
        },
        metaKey: 'meta',
      }),
    ],
  });
  const winstonLoggerInstance = WinstonModule.createLogger({
    instance: loggerInstance,
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: winstonLoggerInstance,
    },
  );

  const httpAdapter = app.get(HttpAdapterHost);

  app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapter, winstonLoggerInstance),
  );
  const appConfig = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle(appConfig.get('app.name'))
    .setDescription('API Documentation')
    .setVersion('v1')
    // .addTag('Suppliers')
    // .addTag('Users')
    // .addTag('Roles')
    // .addTag('Transactions')
    // .addTag('Enum')
    .addBearerAuth(
      {
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.register(contentParser);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useWebSocketAdapter(new SocketAdapter(app));

  await app.listen(appConfig.get('app.port'));
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

