import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Solicitud invalida',
  401: 'No autenticado',
  403: 'No tienes permisos para realizar esta accion',
  404: 'Recurso no encontrado',
  409: 'Conflicto de datos',
  413: 'La solicitud es demasiado grande',
  415: 'Tipo de contenido no soportado',
  429: 'Demasiadas solicitudes',
  500: 'Error interno del servidor',
  503: 'Servicio no disponible',
};

const DEFAULT_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

const isTechnicalMessage = (value: string): boolean => {
  const msg = value.toLowerCase().trim();
  const englishDefaults = new Set([
    'bad request',
    'unauthorized',
    'forbidden',
    'not found',
    'conflict',
    'internal server error',
    'service unavailable',
    'payload too large',
    'unsupported media type',
    'too many requests',
    'gateway timeout',
  ]);

  if (englishDefaults.has(msg)) return true;
  if (/^cannot (get|post|put|patch|delete|options|head)\s/i.test(msg)) return true;

  return false;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message = '';
    let details: string[] | undefined;
    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else {
        const record = body as Record<string, unknown>;
        const raw = record.message;
        const providedCode = record.code;
        const providedDetails = record.details;

        if (Array.isArray(raw)) {
          details = raw.map((item) => String(item));
        } else if (typeof raw === 'string') {
          message = raw;
        }

        if (Array.isArray(providedDetails)) {
          details = providedDetails.map((item) => String(item));
        }

        if (typeof providedCode === 'string' && providedCode.trim()) {
          code = providedCode.trim();
        }
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      this.logger.error(`Excepción no controlada en ${request.method} ${request.url}`, {
        context: 'ExceptionFilter',
        error: exception instanceof Error ? exception.message : String(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    }

    const hasValidationDetails = Array.isArray(details) && details.length > 0;
    if (!code) {
      code = hasValidationDetails ? 'VALIDATION_ERROR' : (DEFAULT_CODES[status] ?? 'ERROR');
    }

    if (hasValidationDetails) {
      message = 'Datos invalidos';
    } else if (!message) {
      message = DEFAULT_MESSAGES[status] ?? DEFAULT_MESSAGES[HttpStatus.INTERNAL_SERVER_ERROR];
    } else if (isTechnicalMessage(message)) {
      message = DEFAULT_MESSAGES[status] ?? DEFAULT_MESSAGES[HttpStatus.INTERNAL_SERVER_ERROR];
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      ...(hasValidationDetails ? { details } : {}),
    });
  }
}
