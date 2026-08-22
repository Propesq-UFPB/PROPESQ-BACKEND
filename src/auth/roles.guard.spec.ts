import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { CurrentUserPayload } from './decorators/current-user.decorator';

function mockContext(user?: Partial<CurrentUserPayload>): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('permite quando não há @Roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(mockContext({ funcao: 'COORDENADOR' }))).toBe(true);
  });

  it('permite ADMIN em rota GESTOR e normaliza o payload', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['GESTOR']);
    const user: CurrentUserPayload = {
      userId: 1,
      email: 'dev@example.com',
      nome: 'Dev',
      funcao: 'ADMIN',
    };

    expect(guard.canActivate(mockContext(user))).toBe(true);
    expect(user.funcao).toBe('GESTOR');
  });

  it('nega COORDENADOR em rota GESTOR', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['GESTOR']);
    expect(() =>
      guard.canActivate(
        mockContext({
          userId: 2,
          email: 'c@c.com',
          nome: 'Coord',
          funcao: 'COORDENADOR',
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('nega usuário sem função', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['GESTOR']);
    expect(() =>
      guard.canActivate(
        mockContext({
          userId: 3,
          email: 'x@x.com',
          nome: 'X',
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
