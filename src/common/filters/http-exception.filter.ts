import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MongoError } from 'mongodb';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    // NestJS HTTP Exceptions (BadRequestException, NotFoundException, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message;
      error = (res as any).error || exception.message;
    }

    // Mongoose Validation Error
    else if (exception instanceof MongooseError.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      message = Object.values(exception.errors).map((e) => e.message);
    }

    // Mongoose CastError (invalid ObjectId)
    else if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Invalid ID';
      message = `Invalid value for field: ${exception.path}`;
    }

    // MongoDB Duplicate Key
    else if (exception instanceof MongoError && exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      error = 'Duplicate Key';
      const field = Object.keys((exception as any).keyValue)[0];
      message = `${field} already exists`;
    }

    // Unknown errors
    else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `[${request.method}] ${request.url} - ${status}: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}