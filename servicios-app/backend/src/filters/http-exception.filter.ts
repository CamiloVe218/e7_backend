import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: false;
  statusCode: number;
  code: string;
  message: string;
  details?: string[];
  suggestion?: string;
  timestamp: string;
  path: string;
}

const PRISMA_ERROR_MAP: Record<string, { status: number; code: string; message: string; suggestion: string }> = {
  P2002: {
    status: 409,
    code: 'CONFLICT',
    message: 'Ya existe un registro con esos datos.',
    suggestion: 'Verifica que el correo o identificador no esté en uso.',
  },
  P2025: {
    status: 404,
    code: 'NOT_FOUND',
    message: 'El recurso solicitado no existe.',
    suggestion: 'Verifica que el ID sea correcto.',
  },
  P2003: {
    status: 400,
    code: 'BAD_REQUEST',
    message: 'Referencia a un recurso inválido.',
    suggestion: 'Asegúrate de que los datos relacionados existan.',
  },
};

function getMessageString(raw: string | string[] | object): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw[0] ?? 'Error de validación.';
  if (typeof raw === 'object' && 'message' in raw) {
    return getMessageString((raw as any).message);
  }
  return 'Error inesperado.';
}

function getDetailsArray(raw: unknown): string[] | undefined {
  if (Array.isArray(raw)) return raw as string[];
  return undefined;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let body: ErrorResponse;

    // ── NestJS HttpException ─────────────────────────────────────────────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse() as any;
      const rawMessage = typeof raw === 'string' ? raw : raw?.message;

      const message = this.toSpanish(status, getMessageString(rawMessage));
      const details = getDetailsArray(rawMessage);
      const suggestion = this.getSuggestion(status);

      body = {
        success: false,
        statusCode: status,
        code: this.statusToCode(status),
        message,
        ...(details && details.length > 1 && { details }),
        ...(suggestion && { suggestion }),
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      if (status >= 500) {
        this.logger.error(`[${status}] ${request.method} ${request.url} — ${message}`);
      }
    }
    // ── Prisma known errors ──────────────────────────────────────────────────
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_ERROR_MAP[exception.code];
      if (mapped) {
        body = {
          success: false,
          statusCode: mapped.status,
          code: mapped.code,
          message: mapped.message,
          suggestion: mapped.suggestion,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      } else {
        this.logger.error(`Prisma error ${exception.code}`, exception.stack);
        body = {
          success: false,
          statusCode: 500,
          code: 'DATABASE_ERROR',
          message: 'Error en la base de datos.',
          suggestion: 'Intenta de nuevo en unos momentos.',
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }
    }
    // ── Prisma validation errors ─────────────────────────────────────────────
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.error('Prisma validation error', exception.message);
      body = {
        success: false,
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Datos enviados incorrectos.',
        suggestion: 'Revisa los campos del formulario.',
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }
    // ── Unknown errors ───────────────────────────────────────────────────────
    else {
      this.logger.error('Unhandled exception', exception);
      body = {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_ERROR',
        message: 'Ocurrió un error interno. Estamos trabajando en ello.',
        suggestion: 'Intenta de nuevo en unos momentos.',
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    response.status(body.statusCode).json(body);
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };
    return map[status] ?? `HTTP_${status}`;
  }

  private toSpanish(status: number, original: string): string {
    // Translate common class-validator messages to Spanish
    const translations: [RegExp, string][] = [
      [/email must be an email/i, 'Ingresa un correo electrónico válido.'],
      [/password must be longer than or equal to (\d+) characters/i, 'La contraseña debe tener al menos $1 caracteres.'],
      [/name must be longer than or equal to (\d+) characters/i, 'El nombre debe tener al menos $1 caracteres.'],
      [/name should not be empty/i, 'El nombre es requerido.'],
      [/email should not be empty/i, 'El correo electrónico es requerido.'],
      [/password should not be empty/i, 'La contraseña es requerida.'],
      [/must be a string/i, 'El valor debe ser texto.'],
      [/must be a number/i, 'El valor debe ser un número.'],
      [/must be an integer/i, 'El valor debe ser un número entero.'],
      [/must not be empty/i, 'Este campo es requerido.'],
      [/is not valid/i, 'El valor ingresado no es válido.'],
    ];

    for (const [pattern, replacement] of translations) {
      if (pattern.test(original)) {
        return original.replace(pattern, replacement);
      }
    }

    // Status-level fallbacks
    const fallbacks: Record<number, string> = {
      400: original || 'Solicitud incorrecta. Revisa los datos enviados.',
      401: 'No autorizado. Inicia sesión para continuar.',
      403: 'No tienes permisos para realizar esta acción.',
      404: 'El recurso solicitado no fue encontrado.',
      409: 'Conflicto: ya existe un registro con esos datos.',
      422: 'Los datos enviados no son procesables.',
      429: 'Demasiadas solicitudes. Espera unos minutos e intenta de nuevo.',
      500: 'Error interno del servidor. Estamos trabajando en ello.',
      503: 'Servicio no disponible temporalmente.',
    };

    return fallbacks[status] ?? original ?? 'Error inesperado.';
  }

  private getSuggestion(status: number): string | undefined {
    const suggestions: Record<number, string> = {
      401: 'Inicia sesión nuevamente para obtener un token válido.',
      403: 'Contacta al administrador si crees que deberías tener acceso.',
      404: 'Verifica que la URL y el identificador sean correctos.',
      429: 'Espera 1 minuto antes de intentar nuevamente.',
      500: 'Si el problema persiste, contacta al equipo de soporte.',
    };
    return suggestions[status];
  }
}
