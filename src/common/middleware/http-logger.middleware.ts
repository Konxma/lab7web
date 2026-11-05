import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { performance } from 'node:perf_hooks';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const started = performance.now();
    res.on('finish', () => {
      const latency = (performance.now() - started).toFixed(2);
      this.logger.log(`${method} ${originalUrl} ${res.statusCode} +${latency}ms [${ip}]`);
    });
    next();
  }
}
