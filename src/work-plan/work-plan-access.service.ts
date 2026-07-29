import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SituacaoProjeto } from '@prisma/client';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import {
  FUNCAO_ORIENTADOR,
  FUNCOES_INDICACAO_PLANO,
  SITUACOES_ELEGIVEIS_INDICACAO,
} from './work-plan-access.constants';

@Injectable()
export class WorkPlanAccessService {
  constructor(private readonly prisma: PrismaService) {}

  isAdminOrGestor(user: CurrentUserPayload): boolean {
    const role = user.funcao?.toUpperCase();
    return role === 'ADMIN' || role === 'GESTOR';
  }

  isCoordenador(user: CurrentUserPayload): boolean {
    return user.funcao?.toUpperCase() === 'COORDENADOR';
  }

  /**
   * Where clause scoping planos to the caller's project membership.
   * ADMIN/GESTOR (e roles sem escopo de coordenação) → undefined (sem filtro).
   * COORDENADOR → filtro por membro Orientador|Coordenador|Coordenador Adjunto.
   */
  async buildScopeWhere(
    user: CurrentUserPayload,
    options?: { forceMemberScope?: boolean },
  ): Promise<Prisma.plano_trabalhoWhereInput | undefined> {
    if (this.isAdminOrGestor(user)) {
      return undefined;
    }

    const applyMemberScope = options?.forceMemberScope === true || this.isCoordenador(user);
    if (!applyMemberScope) {
      return undefined;
    }

    const members = await this.prisma.membro_projeto.findMany({
      where: {
        usuario_id: user.userId,
        ativo: true,
        funcao_projeto: {
          nome: { in: [...FUNCOES_INDICACAO_PLANO] },
        },
      },
      include: {
        funcao_projeto: { select: { nome: true } },
        projeto_pesquisa: {
          select: {
            id: true,
            edital_rel: { select: { apenas_orient_coordena_plano: true } },
          },
        },
      },
    });

    const allowedPesquisaIds = members
      .filter(member => {
        const apenasOrientador =
          member.projeto_pesquisa.edital_rel?.apenas_orient_coordena_plano === true;
        if (apenasOrientador) {
          return member.funcao_projeto.nome === FUNCAO_ORIENTADOR;
        }
        return true;
      })
      .map(member => member.projeto_pesquisa_id);

    if (allowedPesquisaIds.length === 0) {
      return { pesquisa_id: { in: [] } };
    }

    return { pesquisa_id: { in: allowedPesquisaIds } };
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
      select: {
        id: true,
        pesquisa_id: true,
        projeto_pesquisa: {
          select: {
            edital_rel: { select: { apenas_orient_coordena_plano: true } },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plano de trabalho com ID ${planoId} não encontrado`);
    }

    if (this.isAdminOrGestor(user)) {
      return;
    }

    // Rotas de indicação sempre forçam escopo; CRUD genérico só para COORDENADOR.
    const mustCheck =
      options?.forceMemberScope === true || this.isCoordenador(user);
    if (!mustCheck) {
      return;
    }

    const apenasOrientador =
      plan.projeto_pesquisa.edital_rel?.apenas_orient_coordena_plano === true;
    const allowedRoles = apenasOrientador
      ? [FUNCAO_ORIENTADOR]
      : [...FUNCOES_INDICACAO_PLANO];

    const membership = await this.prisma.membro_projeto.findFirst({
      where: {
        projeto_pesquisa_id: plan.pesquisa_id,
        usuario_id: user.userId,
        ativo: true,
        funcao_projeto: { nome: { in: allowedRoles } },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar a indicação deste plano de trabalho.',
      );
    }
  }
}
