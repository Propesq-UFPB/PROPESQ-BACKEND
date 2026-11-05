import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PERMITIR_AVALIADOR_EXTERNO_KEY } from './decorators/permitir-avaliador-externo.decorator';
import type { CurrentUserPayload } from './decorators/current-user.decorator';
import { FUNCAO_AVALIADOR_EXTERNO } from './funcoes';

/**
 * Restringe as sessões de avaliador externo (abertas pelo link) às rotas marcadas com
 * @PermitirAvaliadorExterno(). Necessário porque muitas rotas não usam @Roles e aceitam
 * qualquer usuário autenticado. Também confere, a cada requisição, se o link da sessão
 * continua válido: revogar o link ou desativar o avaliador encerra as sessões abertas.
 * Roda depois do JwtAuthGuard (ordem dos APP_GUARD em AppModule).
 */
@Injectable()
export class AvaliadorExternoGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: CurrentUserPayload }>();
    const user = request.user;
    if (user?.funcao !== FUNCAO_AVALIADOR_EXTERNO) {
      return true;
    }

    const permitido = this.reflector.getAllAndOverride<boolean>(PERMITIR_AVALIADOR_EXTERNO_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permitido) {
      throw new ForbiddenException('Recurso indisponível para o acesso de avaliador externo.');
    }

    const agora = new Date();
    const acesso = await this.prisma.avaliador_acesso.findFirst({
      where: {
        id: typeof user.acesso_id === 'number' ? user.acesso_id : -1,
        revogado_em: null,
        OR: [{ expira_em: null }, { expira_em: { gt: agora } }],
        avaliador: { usuario_id: user.userId, ativo: true },
      },
      select: { id: true },
    });
    if (!acesso) {
      throw new UnauthorizedException('Link de acesso revogado ou expirado.');
    }
    return true;
  }
}
