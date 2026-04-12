import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class KeycloakExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(KeycloakExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Check if it's an error from @keycloak/keycloak-admin-client
    // These errors typically have a 'response' and 'responseData' property
    if (exception.response && exception.responseData) {
      const status = exception.response.status || HttpStatus.BAD_REQUEST;
      const errorData = exception.responseData;
      const message = errorData.errorMessage || errorData.error || exception.message || 'Keycloak Admin Error';

      this.logger.error(
        `Keycloak Admin API Error [${status}]: ${message}`,
        exception.stack,
      );

      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: message,
        error: errorData,
      });
    }

    // Default NestJS handling for other exceptions if not caught by other filters
    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal server error';

    this.logger.error(`Exception: ${message}`, exception.stack);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
