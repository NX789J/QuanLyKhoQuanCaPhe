import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        // Tránh bọc lại dữ liệu nếu controller đã trả về HTML hoặc buffer
        if (data && data.isRawResponse) {
          return data.content;
        }
        return {
          success: true,
          statusCode: response.statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}