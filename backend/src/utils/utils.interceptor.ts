import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express'

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    const statusCode = response.statusCode ?? 200;
    return next.handle().pipe(
      map((data: T) => {
        if(data instanceof StreamableFile){
          return data
        }
        return {
        statusCode,
        success: true,
        data,
        }
      }),
    );
  }
}