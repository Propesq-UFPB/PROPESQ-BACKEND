import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SituacaoProjeto } from '@prisma/client';
import { ProjectMembershipScopeService } from '../common/project-membership-scope.service';
import { SITUACOES_ELEGIVEIS_INDICACAO } from '../common/project-membership.constants';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkPlanAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membership: ProjectMembershipScopeService,
  ) {}

  isAdminOrGestor(user: CurrentUserPayload): boolean {
    return this.membership.isAdminOrGestor(user);
  }

  isCoordenador(user: CurrentUserPayload): boolean {
    return this.membership.isCoordenador(user);
  }

  /**
   * Where clause scoping planos to the caller's project membership.
   * GESTOR (e roles sem escopo de coordenação) → undefined (sem filtro).
   * COORDENADOR → filtro por membro Orientador|Coordenador|Coordenador Adjunto.
   */
  async buildScopeWhere(
    user: CurrentUserPayload,
    options?: { forceMemberScope?: boolean },
  ): Promise<Prisma.plano_trabalhoWhereInput | undefined> {
    const ids = await this.membership.buildAllowedPesquisaIds(user, options);
    if (ids === null) {
      return undefined;
    }
    return { pesquisa_id: { in: ids } };
  }

  /** Default eligibility for the indications list. */
  buildElegibilidadeWhere(): Prisma.plano_trabalhoWhereInput {
    return {
      projeto_pesquisa: {
        edital_id: { not: null },
        situacao: {
          in: [...SITUACOES_ELEGIVEIS_INDICACAO] as SituacaoProjeto[],
        },
      },
    };
  }

  async assertCanAccessPesquisa(
    user: CurrentUserPayload,
    pesquisaId: number,
    options?: { forceMemberScope?: boolean },
  ): Promise<void> {
    return this.membership.assertCanAccessPesquisa(user, pesquisaId, options);
  }

  /**
   * Asserts the user can access a specific plan.
   * @throws NotFoundException if plan does not exist
   * @throws ForbiddenException if plan exists but user has no permission
   */
  async assertCanAccessPlan(
    user: CurrentUserPayload,
    planoId: number,
    options?: { forceMemberScope?: boolean },
  ): Promise<void> {
    const plan = await this.prisma.plano_trabalho.findUnique({
      where: { id: planoId },
      select: { id: true, pesquisa_id: true },
    });

    if (!plan) {
      throw new NotFoundException(`Plano de trabalho com ID ${planoId} não encontrado`);
    }

    await this.membership.assertCanAccessPesquisa(user, plan.pesquisa_id, options);
  }
}
