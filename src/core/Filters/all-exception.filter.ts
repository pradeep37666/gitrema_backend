import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { VALIDATION_MESSAGES } from '../Constants/validation-message';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const req = ctx.getRequest();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const error =
      exception instanceof HttpException
        ? exception.name
        : 'Internal server error';
    const responseBody: any = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      error: error,
    };
    if (exception instanceof HttpException) {
      const res: any = exception.getResponse();
      console.log(res.message);
      const lang = req.headers.lang ?? 'en';
      if (res && res.message) {
        let messageKey = res.message;
        const parts = res.message?.toString()?.split('__');
        if (parts.length > 1) {
          messageKey = parts[0];
        }
        console.log(messageKey);
        if (VALIDATION_MESSAGES[messageKey]) {
          let message = VALIDATION_MESSAGES[messageKey][lang];
          if (parts.length > 1) {
            for (const i in parts) {
              message = message.replace(`{{p${i}}}`, parts[i]);
            }
          }
          responseBody.message = message;
        } else {
          responseBody.message = res.message;
        }
      }
    }

    console.log(req.headers.lang);

    if (httpStatus == 500) {
      const meta = {
        url: req.url,
        query: req.query,
        body: req.body,
        user: req.user,
        stack: exception?.stack,
        exception: exception.name,
      };
      this.logger.error({ message: exception.toString(), meta });
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
