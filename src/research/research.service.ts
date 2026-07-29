import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateResearchDto } from '../research/dto/create-research.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Idioma, SituacaoProjeto, type projeto_pesquisa } from '@prisma/client';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { findOneResearchDto } from './dto/find-one-research.dto';
import { CategoriaProjetoMapper } from '../common/mapper/categoria-projeto.mapper';
import { SituacaoProjetoMapper } from '../common/mapper/situacao-projeto.mapper';
import { TipoProjetoMapper } from '../common/mapper/tipo-projeto.mapper';
import { updateResearchDto } from './dto/update-research.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { AssignEvaluatorDto } from './dto/assign-evaluator.dto';
import { EvaluateProjectDto } from './dto/evaluate-project.dto';
import { FinalDecisionDto } from './dto/final-decision.dto';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async create(createResearchDto: CreateResearchDto): Promise<any> {
    await this.assertAcademicUnitExists(createResearchDto.unidade_id);
    await this.assertCorpoProjetoExists(createResearchDto.corpo_projeto_id);
    await this.assertPalavrasChaveExist(createResearchDto.palavras_chave_ids);
    await this.assertCategoria(createResearchDto.categoria_id);

    if (Array.isArray(createResearchDto.pesquisa_objetivo_ids)) {
      await this.assertObjetivosSustentavelExist(createResearchDto.pesquisa_objetivo_ids);
    }

    if (Array.isArray(createResearchDto.atividade_projeto_pesquisa_ids)) {
      await this.assertAtividadesProjetoPesquisaExist(
        createResearchDto.atividade_projeto_pesquisa_ids,
      );
    }

    return this.prisma.projeto_pesquisa.create({
      data: {
        tipo: createResearchDto.tipo,
        codigo: 'DEFAULT_CODE',
        data_cadastro: new Date(),
        titulo: createResearchDto.titulo,
        title: createResearchDto.title,
        categoria: {
          connect: {
            id: createResearchDto.categoria_id,
          },
        },
        email: createResearchDto.email,
        situacao: SituacaoProjeto.SUBMETIDO,
        data_inicio: createResearchDto.data_inicio,
        data_fim: createResearchDto.data_fim,
        vigencia: createResearchDto.vigencia,
        ...(Array.isArray(createResearchDto.palavras_chave_ids) && {
          palavra_chave: {
            connect: createResearchDto.palavras_chave_ids.map((id: number) => ({ id })),
          },
        }),
        ...(Array.isArray(createResearchDto.pesquisa_objetivo_ids) && {
          objetivos: {
            create: createResearchDto.pesquisa_objetivo_ids.map((objetivo_id: number) => {
              return {
                objetivo: {
                  connect: { id: objetivo_id },
                },
              };
            }),
          },
        }),
        ...(Array.isArray(createResearchDto.atividade_projeto_pesquisa_ids) && {
          atividades: {
            connect: createResearchDto.atividade_projeto_pesquisa_ids.map((id: number) => ({ id })),
          },
        }),
        corpo_projeto: {
          connect: { id: createResearchDto.corpo_projeto_id },
        },
        unidade_academica: {
          connect: { id: createResearchDto.unidade_id },
        },
      },
      include: {
        corpo_projeto: true,
        palavra_chave: true,
        atividades: { include: { meses: true } },
      },
    });
  }

  async findAll(limit: number, offset: number): Promise<PaginatedResult<findOneResearchDto>> {
    const [data, total] = await Promise.all([
      (
        await this.prisma.projeto_pesquisa.findMany({
          include: {
            corpo_projeto: true,
            palavra_chave: true,
            objetivos: true,
            categoria: true,
          },
          take: limit,
          skip: offset,
          orderBy: { data_cadastro: 'desc' },
        })
      ).map(research => {
        return this.formatResearch(research);
      }),
      this.prisma.projeto_pesquisa.count(),
    ]);

    return {
      total,
      limit,
      offset,
      results: data,
    };
  }

  async findMyEvaluations(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult<findOneResearchDto>> {
    const [data, total] = await Promise.all([
      (
        await this.prisma.projeto_pesquisa.findMany({
          where: { avaliador_id: userId },
          include: {
            corpo_projeto: true,
            palavra_chave: true,
            objetivos: true,
            categoria: true,
          },
          take: limit,
          skip: offset,
          orderBy: { data_cadastro: 'desc' },
        })
      ).map(research => {
        return this.formatResearch(research);
      }),
      this.prisma.projeto_pesquisa.count({
        where: { avaliador_id: userId },
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: data,
    };
  }

  async getRanking(limit: number, offset: number): Promise<PaginatedResult<findOneResearchDto>> {
    const [data, total] = await Promise.all([
      (
        await this.prisma.projeto_pesquisa.findMany({
          where: { situacao: SituacaoProjeto.APROVADO },
          include: {
            corpo_projeto: true,
            palavra_chave: true,
            objetivos: true,
            categoria: true,
          },
          take: limit,
          skip: offset,
          orderBy: [{ pontuacao_final: 'desc' }, { data_cadastro: 'asc' }],
        })
      ).map(research => this.formatResearch(research)),
      this.prisma.projeto_pesquisa.count({
        where: { situacao: SituacaoProjeto.APROVADO },
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: data,
    };
  }

  async findOne(id: number): Promise<findOneResearchDto> {
    const data = await this.prisma.projeto_pesquisa.findUnique({
      where: { id: id },
      include: {
        objetivos: {
          include: {
            objetivo: true,
          },
        },
        unidade_academica: true,
        palavra_chave: true,
        corpo_projeto: true,
        anexo_projeto_pesquisa: true,
        categoria: true,
        atividades: {
          include: {
            meses: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Projeto de pesquisa Id ${id} não encontrado`);
    }

    return this.formatResearch(data, true);
  }

  async update(id: number, updateResearchDto: updateResearchDto) {
    await this.findOne(id);

    if (updateResearchDto.unidade_id !== undefined) {
      await this.assertAcademicUnitExists(updateResearchDto.unidade_id);
    }

    if (updateResearchDto.corpo_projeto_id !== undefined) {
      await this.assertCorpoProjetoExists(updateResearchDto.corpo_projeto_id);
    }

    if (Array.isArray(updateResearchDto.palavras_chave_ids)) {
      await this.assertPalavrasChaveExist(updateResearchDto.palavras_chave_ids);
    }

    if (Array.isArray(updateResearchDto.pesquisa_objetivo_ids)) {
      await this.assertObjetivosSustentavelExist(updateResearchDto.pesquisa_objetivo_ids);
    }

    if (Array.isArray(updateResearchDto.atividade_projeto_pesquisa_ids)) {
      await this.assertAtividadesProjetoPesquisaExist(
        updateResearchDto.atividade_projeto_pesquisa_ids,
      );
    }

    if (updateResearchDto.categoria_id) {
      await this.assertCategoria(updateResearchDto.categoria_id);
    }

    return this.prisma.projeto_pesquisa.update({
      where: { id: id },
      data: {
        tipo: updateResearchDto.tipo,
        titulo: updateResearchDto.titulo,
        title: updateResearchDto.title,
        ...(updateResearchDto.categoria_id !== undefined && {
          categoria: {
            connect: {
              id: updateResearchDto.categoria_id,
            },
          },
        }),
        email: updateResearchDto.email,
        data_inicio: updateResearchDto.data_inicio,
        data_fim: updateResearchDto.data_fim,
        vigencia: updateResearchDto.vigencia,
        ...(Array.isArray(updateResearchDto.palavras_chave_ids) && {
          palavra_chave: {
            set: updateResearchDto.palavras_chave_ids.map((id: number) => ({ id })),
          },
        }),
        ...(Array.isArray(updateResearchDto.pesquisa_objetivo_ids) && {
          objetivos: {
            deleteMany: {},
            create: updateResearchDto.pesquisa_objetivo_ids.map((objetivo_id: number) => ({
              objetivo: {
                connect: { id: objetivo_id },
              },
            })),
          },
        }),
        ...(Array.isArray(updateResearchDto.atividade_projeto_pesquisa_ids) && {
          atividades: {
            set: updateResearchDto.atividade_projeto_pesquisa_ids.map((id: number) => ({ id })),
          },
        }),
        ...(updateResearchDto.corpo_projeto_id !== undefined && {
          corpo_projeto: {
            connect: { id: updateResearchDto.corpo_projeto_id },
          },
        }),
        ...(updateResearchDto.unidade_id !== undefined && {
          unidade_academica: {
            connect: {
              id: updateResearchDto.unidade_id,
            },
          },
        }),
      },
      include: { corpo_projeto: true, palavra_chave: true },
    });
  }

  private formatResearch(research, full: boolean = false): findOneResearchDto {
    const formatted_research: findOneResearchDto = {
      id: research.id,
      tipo: TipoProjetoMapper[research.tipo],
      titulo: research.titulo,
      title: research.title,
      categoria: research.categoria.denominacao,
      codigo: research.codigo,
      email: research.email,
      situacao: SituacaoProjetoMapper[research.situacao],
      data_cadastro: research.data_cadastro.toLocaleDateString('pt-br'),
      key_words: research.palavra_chave
        .filter(_ => _.lingua === Idioma.EN)
        .map(_ => {
          return _.palavra_chave;
        }),
      palavras_chave: research.palavra_chave
        .filter(_ => _.lingua === Idioma.PT)
        .map(_ => {
          return _.palavra_chave;
        }),
      objetivos: research?.objetivos?.map(objetivo => {
        return objetivo.objetivo;
      }),
      atividades: research?.atividades?.map(atividade => {
        return {
          descricao: atividade.descricao,
          meses: atividade.meses.map(mes => {
            return mes.data;
          }),
        };
      }),
    };

    if (full) {
      formatted_research.corpo = {
        resumo: research.corpo_projeto.resumo,
        abstract: research.corpo_projeto.abstract,
        introducao: research.corpo_projeto.introducao,
        objetivos: research.corpo_projeto.objetivos,
        metodologia: research.corpo_projeto.metodologia,
        referencias: research.corpo_projeto.referencias,
        resultados_esperados: research.corpo_projeto.resultados_esperados,
      };
    }

    return formatted_research;
  }

  async delete(id: number) {
    const research_exists = await this.prisma.projeto_pesquisa.findUnique({
      where: { id },
    });

    if (!research_exists) {
      throw new NotFoundException(`Projeto de pesquisa Id ${id} não encontrado`);
    }

    return this.prisma.projeto_pesquisa.delete({
      where: { id },
      include: {
        anexo_projeto_pesquisa: true,
        objetivos: true,
        palavra_chave: true,
        corpo_projeto: true,
      },
    });
  }

  async publish(id: number, currentUser: CurrentUserPayload): Promise<void> {
    const research = await this.prisma.projeto_pesquisa.findUnique({
      where: { id },
      select: {
        id: true,
        situacao: true,
        unidade_id: true,
      },
    });

    if (!research) {
      throw new NotFoundException(`Projeto de pesquisa Id ${id} não encontrado`);
    }

    if (currentUser.funcao?.toUpperCase() !== 'COORDENADOR') {
      throw new ForbiddenException('Apenas coordenadores podem publicar projetos.');
    }

    if (currentUser.unidade_id !== undefined && currentUser.unidade_id !== research.unidade_id) {
      throw new ForbiddenException(
        'Coordenador não autorizado a publicar projeto de outra unidade acadêmica.',
      );
    }

    const allowedTransitions = new Set<SituacaoProjeto>([
      SituacaoProjeto.SUBMETIDO,
      SituacaoProjeto.AGUARDANDO_VALIDACAO,
      SituacaoProjeto.VALIDADO,
      SituacaoProjeto.CADASTRADO,
    ]);

    if (!allowedTransitions.has(research.situacao)) {
      throw new BadRequestException(
        `Projeto em situação ${research.situacao} não pode ser publicado.`,
      );
    }

    await this.prisma.projeto_pesquisa.update({
      where: { id },
      data: {
        situacao: SituacaoProjeto.PUBLICADO,
      },
    });
  }

  async assignEvaluator(id: number, assignEvaluatorDto: AssignEvaluatorDto): Promise<void> {
    const project = await this.prisma.projeto_pesquisa.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException(`Projeto de pesquisa Id ${id} não encontrado`);
    }

    const evaluator = await this.prisma.usuario.findUnique({
      where: { id: assignEvaluatorDto.coordinator_id },
      include: { funcao: true },
    });

    if (!evaluator) {
      throw new NotFoundException(`Usuário Id ${assignEvaluatorDto.coordinator_id} não encontrado`);
    }

    if (evaluator.funcao?.nome.toUpperCase() !== 'COORDENADOR') {
      throw new ForbiddenException('O utilizador atribuído deve ter a função de COORDENADOR.');
    }

    await this.prisma.projeto_pesquisa.update({
      where: { id },
      data: {
        avaliador_id: assignEvaluatorDto.coordinator_id,
        situacao: SituacaoProjeto.DISTRIBUICAO_PARA_AVALIACAO_MANUALMENTE,
      },
    });
  }

  async evaluateProject(
    id: number,
    userId: number,
    evaluateDto: EvaluateProjectDto,
  ): Promise<void> {
    const project = await this.prisma.projeto_pesquisa.findUnique({
      where: { id },
      select: { id: true, avaliador_id: true },
    });

    if (!project) {
      throw new NotFoundException(`Projeto de pesquisa Id ${id} não encontrado`);
    }

    if (project.avaliador_id !== userId) {
      throw new ForbiddenException(
        'Não tem permissão para avaliar este projeto. O projeto foi atribuído a outro coordenador.',
      );
    }

    await this.prisma.projeto_pesquisa.update({
      where: { id },
      data: {
        situacao: evaluateDto.status,
      },
    });

    await this.prisma.historico_avaliacao.create({
      data: {
        projeto_id: id,
        avaliador_id: userId,
        status: evaluateDto.status,
        observacao: evaluateDto.observacao,
        data_avaliacao: new Date(),
      },
    });
  }

  async finalDecision(id: number, userId: number, dto: FinalDecisionDto): Promise<void> {
    const project = await this.prisma.projeto_pesquisa.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException(`Projeto de pesquisa Id ${id} não encontrado`);
    }

    if (dto.situacao !== SituacaoProjeto.APROVADO && dto.situacao !== SituacaoProjeto.REPROVADO) {
      throw new BadRequestException('A situação deve ser estritamente APROVADO ou REPROVADO.');
    }

    // Utiliza uma transação para garantir que a situação é atualizada
    // e o histórico é gravado em simultâneo.
    await this.prisma.$transaction(async tx => {
      await tx.projeto_pesquisa.update({
        where: { id },
        data: {
          situacao: dto.situacao,
          pontuacao_final: dto.pontuacao_final,
        },
      });

      await tx.historico_avaliacao.create({
        data: {
          projeto_id: id,
          avaliador_id: userId,
          status: dto.situacao,
          observacao: dto.justificativa,
          data_avaliacao: new Date(),
        },
      });
    });
  }

  private async assertAcademicUnitExists(unidadeId: number): Promise<void> {
    const academicUnit = await this.prisma.unidade_academica.findUnique({
      where: { id: unidadeId },
      select: { id: true },
    });

    if (!academicUnit) {
      throw new NotFoundException(`Unidade acadêmica com id ${unidadeId} não encontrada`);
    }
  }

  private async assertCorpoProjetoExists(corpoProjetoId: number): Promise<void> {
    const corpoProjeto = await this.prisma.corpo_projeto.findUnique({
      where: { id: corpoProjetoId },
      select: { id: true },
    });

    if (!corpoProjeto) {
      throw new NotFoundException(`Corpo de projeto com id ${corpoProjetoId} não encontrado`);
    }
  }

  private async assertPalavrasChaveExist(ids: number[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    const found = await this.prisma.palavra_chave.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });

    const foundIds = new Set(found.map(item => item.id));
    const missingIds = uniqueIds.filter(id => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Palavra(s)-chave não encontrada(s) para os ids: ${missingIds.join(', ')}`,
      );
    }
  }

  private async assertObjetivosSustentavelExist(ids: number[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    const found = await this.prisma.objetivo_desenvolvimento_sustentavel.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });

    const foundIds = new Set(found.map(item => item.id));
    const missingIds = uniqueIds.filter(id => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Objetivo(s) de desenvolvimento sustentável não encontrado(s) para os ids: ${missingIds.join(', ')}`,
      );
    }
  }

  private async assertAtividadesProjetoPesquisaExist(ids: number[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    const found = await this.prisma.atividade_projeto_pesquisa.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });

    const foundIds = new Set(found.map(item => item.id));
    const missingIds = uniqueIds.filter(id => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Atividade(s) de projeto de pesquisa não encontrada(s) para os ids: ${missingIds.join(', ')}`,
      );
    }
  }

  private async assertCategoria(id: number): Promise<void> {
    const categoria = await this.prisma.categoria_edital.findUnique({ where: { id: id } });

    if (!categoria) {
      throw new NotFoundException(`Categoria id ${id} não existente`);
    }
  }
}
