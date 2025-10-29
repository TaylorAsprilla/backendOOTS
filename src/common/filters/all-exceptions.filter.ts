import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || exception.message;
        error = (responseObj.error as string) || error;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;

      // Handle specific MySQL errors
      const sqlError = exception as QueryFailedError & {
        code?: string;
        sqlMessage?: string;
      };

      if (sqlError.code === 'ER_DUP_ENTRY') {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate entry error';

        if (sqlError.sqlMessage?.includes('document_number')) {
          message = 'A participant with this document number already exists';
        } else if (sqlError.sqlMessage?.includes('phone_number')) {
          message = 'A participant with this phone number already exists';
        } else if (sqlError.sqlMessage?.includes('email')) {
          message = 'A participant with this email already exists';
        }
      } else if (sqlError.code === 'ER_NO_REFERENCED_ROW_2') {
        message = 'Referenced record not found';
      } else {
        message = 'Database operation failed';
      }

      error = 'Database Error';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message: Array.isArray(message) ? message : [message],
    };

    response.status(status).json(errorResponse);
  }
}
