import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { performance } from 'node:perf_hooks';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TIMING');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const started = performance.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    return next.handle().pipe(tap(() => {
      const elapsed = (performance.now() - started).toFixed(2);
      response.setHeader('X-Response-Time', `${elapsed}ms`);
      this.logger.log(`${request.method} ${request.originalUrl} виконано за ${elapsed}ms`);
    }));
  }
}
