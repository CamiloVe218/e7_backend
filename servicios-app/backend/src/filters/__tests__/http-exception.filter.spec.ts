import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GlobalExceptionFilter } from '../http-exception.filter';

// Build a minimal ArgumentsHost mock that captures the JSON response
function buildMockHost(url = '/api/test') {
  const jsonMock = jest.fn();
  const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  const responseMock = { status: statusMock, json: jsonMock };
  const requestMock = { url };

  const host = {
    switchToHttp: () => ({
      getResponse: () => responseMock,
      getRequest:  () => requestMock,
    }),
  } as unknown as ArgumentsHost;

  return { host, statusMock, jsonMock };
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  // ── HttpException ─────────────────────────────────────────────────────────────

  describe('HttpException handling', () => {
    it('returns correct status and code for 400 BadRequest', () => {
      const { host, statusMock, jsonMock } = buildMockHost();
      filter.catch(new HttpException('Bad request', HttpStatus.BAD_REQUEST), host);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, code: 'BAD_REQUEST', success: false }),
      );
    });

    it('returns 401 UNAUTHORIZED for UnauthorizedException', () => {
      const { host, statusMock } = buildMockHost();
      filter.catch(new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED), host);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('returns 403 FORBIDDEN', () => {
      const { host, statusMock } = buildMockHost();
      filter.catch(new HttpException('Forbidden', HttpStatus.FORBIDDEN), host);
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('returns 404 NOT_FOUND', () => {
      const { host, statusMock, jsonMock } = buildMockHost();
      filter.catch(new HttpException('Not found', HttpStatus.NOT_FOUND), host);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'NOT_FOUND' }),
      );
    });

    it('returns 409 CONFLICT', () => {
      const { host, statusMock } = buildMockHost();
      filter.catch(new HttpException('Conflict', HttpStatus.CONFLICT), host);
      expect(statusMock).toHaveBeenCalledWith(409);
    });

    it('returns 429 TOO_MANY_REQUESTS', () => {
      const { host, statusMock, jsonMock } = buildMockHost();
      filter.catch(new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS), host);
      expect(statusMock).toHaveBeenCalledWith(429);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'TOO_MANY_REQUESTS' }),
      );
    });

    it('includes timestamp and path in every response', () => {
      const { host, jsonMock } = buildMockHost('/api/auth/login');
      filter.catch(new HttpException('Error', HttpStatus.BAD_REQUEST), host);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/api/auth/login', timestamp: expect.any(String) }),
      );
    });

    it('translates class-validator email message to Spanish', () => {
      const { host, jsonMock } = buildMockHost();
      filter.catch(
        new HttpException({ message: 'email must be an email' }, HttpStatus.BAD_REQUEST),
        host,
      );
      const call = jsonMock.mock.calls[0][0];
      expect(call.message).toContain('correo');
    });

    it('translates password minLength message to Spanish', () => {
      const { host, jsonMock } = buildMockHost();
      filter.catch(
        new HttpException(
          { message: 'password must be longer than or equal to 6 characters' },
          HttpStatus.BAD_REQUEST,
        ),
        host,
      );
      const call = jsonMock.mock.calls[0][0];
      expect(call.message).toContain('contraseña');
    });

    it('extracts details array from validation errors', () => {
      const { host, jsonMock } = buildMockHost();
      filter.catch(
        new HttpException(
          { message: ['email must be an email', 'name should not be empty'] },
          HttpStatus.BAD_REQUEST,
        ),
        host,
      );
      const call = jsonMock.mock.calls[0][0];
      expect(call.details).toHaveLength(2);
    });

    it('includes suggestion for 401 responses', () => {
      const { host, jsonMock } = buildMockHost();
      filter.catch(new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED), host);
      const call = jsonMock.mock.calls[0][0];
      expect(call.suggestion).toBeTruthy();
    });
  });

  // ── Prisma known errors ───────────────────────────────────────────────────────

  describe('Prisma known error handling', () => {
    function makePrismaError(code: string): Prisma.PrismaClientKnownRequestError {
      return new Prisma.PrismaClientKnownRequestError('mock message', {
        code,
        clientVersion: '5.0.0',
      });
    }

    it('maps P2002 (unique constraint) to 409 CONFLICT', () => {
      const { host, statusMock, jsonMock } = buildMockHost();
      filter.catch(makePrismaError('P2002'), host);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'CONFLICT' }),
      );
    });

    it('maps P2025 (record not found) to 404 NOT_FOUND', () => {
      const { host, statusMock } = buildMockHost();
      filter.catch(makePrismaError('P2025'), host);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('maps P2003 (foreign key constraint) to 400 BAD_REQUEST', () => {
      const { host, statusMock } = buildMockHost();
      filter.catch(makePrismaError('P2003'), host);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('maps unknown Prisma error codes to 500 DATABASE_ERROR', () => {
      const { host, statusMock, jsonMock } = buildMockHost();
      filter.catch(makePrismaError('P9999'), host);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'DATABASE_ERROR' }),
      );
    });
  });

  // ── Prisma validation errors ──────────────────────────────────────────────────

  describe('Prisma validation error handling', () => {
    it('maps PrismaClientValidationError to 400 VALIDATION_ERROR', () => {
      const { host, statusMock, jsonMock } = buildMockHost();
      const err = new Prisma.PrismaClientValidationError('validation error', {
        clientVersion: '5.0.0',
      });
      filter.catch(err, host);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      );
    });
  });

  // ── Unknown errors ────────────────────────────────────────────────────────────

  describe('unknown error handling', () => {
    it('returns 500 INTERNAL_ERROR for unhandled exceptions', () => {
      const { host, statusMock, jsonMock } = buildMockHost();
      filter.catch(new Error('Something completely unexpected'), host);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'INTERNAL_ERROR', success: false }),
      );
    });

    it('returns 500 for non-Error thrown values', () => {
      const { host, statusMock } = buildMockHost();
      filter.catch('a string error', host);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});
