import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = exception.getStatus();
    const details = exception.getResponse();
    const payload = typeof details === 'object'
      ? details as { message?: string | string[]; error?: string }
      : { message: details };
    const message = payload.message ?? exception.message;
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      method: request.method,
      error: payload.error ?? HttpStatus[status].split('_').map((word) => word[0] + word.slice(1).toLowerCase()).join(' '),
      message: Array.isArray(message) ? message : [message],
    });
  }
}
