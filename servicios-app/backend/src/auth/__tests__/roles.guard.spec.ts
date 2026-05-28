import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';

function buildContext(role: string, handler = jest.fn(), klass = jest.fn()): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass:   () => klass,
    switchToHttp: () => ({
      getRequest: () => ({ user: { role } }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('allows access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(buildContext('CLIENTE'))).toBe(true);
  });

  it('allows access when user role matches required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(guard.canActivate(buildContext('ADMIN'))).toBe(true);
  });

  it('denies access when user role does not match', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(guard.canActivate(buildContext('CLIENTE'))).toBe(false);
  });

  it('allows access when user role is one of multiple required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['CLIENTE', 'PROVEEDOR']);
    expect(guard.canActivate(buildContext('PROVEEDOR'))).toBe(true);
  });

  it('denies access when user role is not in multi-role list', () => {
    reflector.getAllAndOverride.mockReturnValue(['CLIENTE', 'PROVEEDOR']);
    expect(guard.canActivate(buildContext('ADMIN'))).toBe(false);
  });
});
