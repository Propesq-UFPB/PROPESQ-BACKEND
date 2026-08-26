import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TipoMembroProjeto } from '@prisma/client';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { FUNCAO_ORIENTADOR, FUNCOES_GESTAO_PLANO } from './project-membership.constants';

@Injectable()
export class ProjectMembershipScopeService {
  constructor(private readonly prisma: PrismaService) {}

  isGestor(user: CurrentUserPayload): boolean {
    return user.funcao?.toUpperCase() === 'GESTOR';
  }

  isCoordenador(user: CurrentUserPayload): boolean {
    return user.funcao?.toUpperCase() === 'COORDENADOR';
  }

  /**
   * IDs de projeto_pesquisa acessíveis ao usuário por membership.
   * GESTOR → null (sem restrição).
   * Sem escopo de coordenação → null.
   * COORDENADOR (ou force) → lista (pode ser vazia).
   */
  async buildAllowedPesquisaIds(
    user: CurrentUserPayload,
    options?: { forceMemberScope?: boolean },
  ): Promise<number[] | null> {
    if (this.isGestor(user)) {
      return null;
    }

    const applyMemberScope = options?.forceMemberScope === true || this.isCoordenador(user);
    if (!applyMemberScope) {
      return null;
    }

    const [legacyMembers, researchMembers] = await Promise.all([
      this.prisma.membro_projeto.findMany({
        where: {
          usuario_id: user.userId,
          ativo: true,
          funcao_projeto: {
            nome: { in: [...FUNCOES_GESTAO_PLANO] },
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
      }),
      this.prisma.projeto_membro.findMany({
        where: {
          user_id: user.userId,
          funcao: {
            in: [TipoMembroProjeto.COORDENADOR, TipoMembroProjeto.COORDENADOR_ADJ],
          },
        },
        select: {
          projeto_id: true,
          funcao: true,
          projeto_pesquisa: {
            select: {
              edital_rel: { select: { apenas_orient_coordena_plano: true } },
            },
          },
        },
      }),
    ]);

    const legacyProjectIds = legacyMembers
      .filter(member => {
        const apenasOrientador =
          member.projeto_pesquisa.edital_rel?.apenas_orient_coordena_plano === true;
        if (apenasOrientador) {
          return member.funcao_projeto.nome === FUNCAO_ORIENTADOR;
        }
        return true;
      })
      .map(member => member.projeto_pesquisa_id);

    const researchProjectIds = researchMembers
      .filter(member => {
        const apenasOrientador =
          member.projeto_pesquisa.edital_rel?.apenas_orient_coordena_plano === true;
        return !apenasOrientador || member.funcao === TipoMembroProjeto.COORDENADOR;
      })
      .map(member => member.projeto_id);

    return [...new Set([...legacyProjectIds, ...researchProjectIds])];
  }

  /**
   * Asserts membership on a research project.
   * @throws NotFoundException if project does not exist
   * @throws ForbiddenException if user lacks permission
   */
  async assertCanAccessPesquisa(
    user: CurrentUserPayload,
    pesquisaId: number,
    options?: { forceMemberScope?: boolean },
  ): Promise<void> {
    const projeto = await this.prisma.projeto_pesquisa.findUnique({
      where: { id: pesquisaId },
      select: {
        id: true,
        edital_rel: { select: { apenas_orient_coordena_plano: true } },
      },
    });

    if (!projeto) {
      throw new NotFoundException(`Projeto de pesquisa com ID ${pesquisaId} não encontrado`);
    }

    if (this.isGestor(user)) {
      return;
    }

    const mustCheck = options?.forceMemberScope === true || this.isCoordenador(user);
    if (!mustCheck) {
      return;
    }

    const apenasOrientador = projeto.edital_rel?.apenas_orient_coordena_plano === true;
    const allowedRoles = apenasOrientador ? [FUNCAO_ORIENTADOR] : [...FUNCOES_GESTAO_PLANO];

    const legacyMembership = await this.prisma.membro_projeto.findFirst({
      where: {
        projeto_pesquisa_id: pesquisaId,
        usuario_id: user.userId,
        ativo: true,
        funcao_projeto: { nome: { in: allowedRoles } },
      },
    });

    if (legacyMembership) {
      return;
    }

    const allowedResearchRoles = apenasOrientador
      ? [TipoMembroProjeto.COORDENADOR]
      : [TipoMembroProjeto.COORDENADOR, TipoMembroProjeto.COORDENADOR_ADJ];
    const researchMembership = await this.prisma.projeto_membro.findFirst({
      where: {
        projeto_id: pesquisaId,
        user_id: user.userId,
        funcao: { in: allowedResearchRoles },
      },
    });

    if (!researchMembership) {
      throw new ForbiddenException('Você não tem permissão para acessar este projeto de pesquisa.');
    }
  }
}
