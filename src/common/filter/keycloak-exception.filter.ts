import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalKeycloakExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('KeycloakException');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default to 500 Internal Server Error
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorData = null;

    // 1. Handle standard NestJS HttpExceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }
    // 2. Handle Keycloak Admin Client Errors (usually 400, 401, 403, 409)
    else if (exception.response && exception.response.status) {
      status = exception.response.status;
      message = exception.response.data?.errorMessage || exception.message;
      errorData = exception.response.data;
    }
    // 3. Handle Generic Errors with a 'response' object (like Axios/Fetch errors)
    else if (exception.status) {
      status = exception.status;
      message = exception.message;
    }

    this.logger.error(
      `Method: ${request.method} URL: ${request.url} Status: ${status} Message: ${message}`,
      exception.stack,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      details: errorData,
    });
  }
}
