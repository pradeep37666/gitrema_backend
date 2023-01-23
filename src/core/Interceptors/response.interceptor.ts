import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { SKIP_INTERCEPTOR } from '../decorators/skip-interceptor.decorator';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(@Inject() private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const decoratorSkip =
      this.reflector.get(SKIP_INTERCEPTOR, context.getClass()) ||
      this.reflector.get(SKIP_INTERCEPTOR, context.getHandler());
    if (decoratorSkip) {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => ({
        data,
        statusCode: HttpStatus.OK,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
