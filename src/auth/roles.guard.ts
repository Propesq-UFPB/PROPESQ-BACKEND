import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentUserPayload } from './decorators/current-user.decorator';
import { ROLES_KEY } from './decorators/roles.decorator';
import { normalizeSystemFuncao } from './normalize-system-funcao';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: CurrentUserPayload }>();
    const role = normalizeSystemFuncao(request.user?.funcao);

    if (request.user && role) {
      request.user.funcao = role;
    }

    if (!role) {
      throw new ForbiddenException('Usuário autenticado sem função para autorização por papel.');
    }

    const hasRole = requiredRoles.some(requiredRole => requiredRole.toUpperCase() === role);

    if (!hasRole) {
      throw new ForbiddenException('Acesso permitido apenas para perfis autorizados.');
    }

    return true;
  }
}
