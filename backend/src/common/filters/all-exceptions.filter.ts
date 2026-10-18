import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'INTERNAL_SERVER_ERROR';
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || exception.message;
      }

      switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
          error = 'VALIDATION_ERROR';
          break;
        case HttpStatus.NOT_FOUND:
          error = 'NOT_FOUND';
          break;
        case HttpStatus.CONFLICT:
          error = 'CONFLICT';
          break;
        case HttpStatus.UNAUTHORIZED:
          error = 'UNAUTHORIZED';
          break;
        case HttpStatus.FORBIDDEN:
          error = 'FORBIDDEN';
          break;
        default:
          error = (exception as any).name || 'HTTP_ERROR';
      }
    } else if (exception instanceof Error) {
      // Prisma error handling if needed
      if ((exception as any).code === 'P2025') {
        statusCode = HttpStatus.NOT_FOUND;
        error = 'NOT_FOUND';
        message = 'Record not found';
      } else {
        message = exception.message || 'Internal server error';
      }
    }

    // Ensure array messages from class-validator are joined or cleanly presented
    if (Array.isArray(message)) {
      message = message.join('; ');
    }

    response.status(statusCode).json({
      statusCode,
      error,
      message,
    });
  }
}
