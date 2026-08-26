import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateResearchDto } from '../research/dto/create-research.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Idioma, Prisma, SituacaoProjeto } from '@prisma/client';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { findOneResearchDto } from './dto/find-one-research.dto';
import { SituacaoProjetoMapper } from '../common/mapper/situacao-projeto.mapper';
import { TipoProjetoMapper } from '../common/mapper/tipo-projeto.mapper';
import { updateResearchDto } from './dto/update-research.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { ProjectMembershipScopeService } from '../common/project-membership-scope.service';
import { AssignEvaluatorDto } from './dto/assign-evaluator.dto';
import { EvaluateProjectDto } from './dto/evaluate-project.dto';
import { FinalDecisionDto } from './dto/final-decision.dto';
import {
  CategoriaMembroProjeto,
  ResearchAttachmentResponseDto,
  ResearchGroupLookupDto,
  ResearchLookupDto,
  ResearchMemberLookupsDto,
  ResearchUserLookupDto,
} from './dto/research-lookups.dto';
import { ResearchUserLookupQueryDto } from './dto/research-user-lookup-query.dto';
import {
  MembroExternoFormacaoMapper,
  TipoMembroExternoMapper,
  TipoMembroProjetoMapper,
  TipoSexoMapper,
} from '../common/mapper/membro-projeto.mapper';

type UploadedResearchFile = {
  buffer?: Buffer;
  mimetype?: string;
  originalname?: string;
};

@Injectable()
export class ResearchService {
  constructor(
    private prisma: PrismaService,
    private membership: ProjectMembershipScopeService,
  ) {}

  async create(createResearchDto: CreateResearchDto): Promise<any> {
    const edital = await this.assertEditalExists(createResearchDto.edital_id);
    await this.assertAcademicUnitExists(createResearchDto.unidade_id);
    await this.assertKnowledgeAreaExists(createResearchDto.area_conhecimento_id);

    if (Array.isArray(createResearchDto.palavras_chave_ids)) {
      await this.assertPalavrasChaveExist(createResearchDto.palavras_chave_ids);
    }

    const hasKeywordIds = Boolean(createResearchDto.palavras_chave_ids?.length);
    const palavrasChave = this.normalizeKeywords(createResearchDto.palavras_chave);
    const keyWords = this.normalizeKeywords(createResearchDto.key_words);

    if (!hasKeywordIds && (palavrasChave.length === 0 || keyWords.length === 0)) {
      throw new BadRequestException(
        'Informe palavras-chave em português e inglês para cadastrar o projeto.',
      );
    }

    const categoriaId = edital.categoria_id;
    if (createResearchDto.categoria_id && createResearchDto.categoria_id !== categoriaId) {
      throw new BadRequestException('A categoria informada não corresponde à categoria do edital.');
    }

    if (Array.isArray(createResearchDto.pesquisa_objetivo_ids)) {
      await this.assertObjetivosSustentavelExist(createResearchDto.pesquisa_objetivo_ids);
    }

    if (Array.isArray(createResearchDto.membros)) {
      const memberUserIds = createResearchDto.membros.map(membro => membro.user_id);
      if (new Set(memberUserIds).size !== memberUserIds.length) {
        throw new BadRequestException(
          'Um usuário não pode ser adicionado mais de uma vez ao projeto.',
        );
      }
      await this.assertUsersExist(memberUserIds);
    }

    if (
      (createResearchDto.membros?.length ?? 0) +
        (createResearchDto.membros_externos?.length ?? 0) ===
      0
    ) {
      throw new BadRequestException('O projeto deve possuir pelo menos um membro.');
    }

    if (createResearchDto.vinculado_grupo_pesquisa) {
      if (!createResearchDto.grupo_pesquisa_id) {
        throw new BadRequestException(
          'O grupo de pesquisa é obrigatório quando o projeto está vinculado a um grupo.',
        );
      }
      await this.assertResearchGroupExists(createResearchDto.grupo_pesquisa_id);
    }

    if (
      createResearchDto.possui_comite_etica &&
      (!createResearchDto.comite_etica?.trim() || !createResearchDto.numero_protocolo?.trim())
    ) {
      throw new BadRequestException(
        'Comitê de ética e número do protocolo são obrigatórios quando essa opção é marcada.',
      );
    }

    this.assertProjectDates(createResearchDto.data_inicio, createResearchDto.data_fim);

    return this.prisma.projeto_pesquisa.create({
      data: {
        tipo: createResearchDto.tipo,
        codigo: 'DEFAULT_CODE',
        data_cadastro: new Date(),
        titulo: createResearchDto.titulo,
        title: createResearchDto.title,
        categoria: {
          connect: {
            id: categoriaId,
          },
        },
        email: createResearchDto.email,
        situacao: SituacaoProjeto.SUBMETIDO,
        data_inicio: createResearchDto.data_inicio
          ? new Date(createResearchDto.data_inicio)
          : undefined,
        data_fim: createResearchDto.data_fim ? new Date(createResearchDto.data_fim) : undefined,
        vigencia: new Date(createResearchDto.vigencia),
        edital_rel: { connect: { id: createResearchDto.edital_id } },
        area_conhecimento: { connect: { id: createResearchDto.area_conhecimento_id } },
        linha_pesquisa: createResearchDto.linha_pesquisa.trim(),
        grupo_pesquisa:
          createResearchDto.vinculado_grupo_pesquisa && createResearchDto.grupo_pesquisa_id
            ? { connect: { id: createResearchDto.grupo_pesquisa_id } }
            : undefined,
        comite_etica: createResearchDto.possui_comite_etica
          ? createResearchDto.comite_etica?.trim()
          : null,
        numero_protocolo: createResearchDto.possui_comite_etica
          ? createResearchDto.numero_protocolo?.trim()
          : null,
        ...(Array.isArray(createResearchDto.palavras_chave_ids) && {
          palavra_chave: {
            connect: createResearchDto.palavras_chave_ids.map((id: number) => ({ id })),
          },
        }),
        ...(!hasKeywordIds && {
          palavra_chave: {
            create: [
              ...palavrasChave.map(palavra_chave => ({ palavra_chave, lingua: Idioma.PT })),
              ...keyWords.map(palavra_chave => ({ palavra_chave, lingua: Idioma.EN })),
            ],
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
        atividades: {
          create: createResearchDto.atividades.map(atividade => ({
            descricao: atividade.descricao,
            meses: {
              create: atividade.meses.map(mes => ({ data: new Date(mes.data) })),
            },
          })),
        },
        corpo_projeto: {
          create: createResearchDto.corpo_projeto,
        },
        unidade_academica: {
          connect: { id: createResearchDto.unidade_id },
        },
        ...(Array.isArray(createResearchDto.membros) && {
          projetoMembros: {
            create: createResearchDto.membros.map(membro => ({
              user_id: membro.user_id,
              funcao: membro.funcao,
              ch_dedicadas: membro.ch_dedicadas,
            })),
          },
        }),
        ...(Array.isArray(createResearchDto.membros_externos) && {
          projetoMembroExternos: {
            create: createResearchDto.membros_externos.map(membro => ({
              funcao: membro.funcao,
              ch_dedicada: membro.ch_dedicada,
              cpf: membro.cpf,
              nome: membro.nome,
              email: membro.email,
              sexo: membro.sexo,
              formacao: membro.formacao,
              tipo: membro.tipo,
            })),
          },
        }),
      },
      include: {
        categoria: true,
        corpo_projeto: true,
        palavra_chave: true,
        atividades: { include: { meses: true } },
        projetoMembros: true,
        projetoMembroExternos: true,
      },
    });
  }

  async getSustainableDevelopmentGoals(): Promise<ResearchLookupDto<number>[]> {
    const rows = await this.prisma.objetivo_desenvolvimento_sustentavel.findMany({
      select: { id: true, tipo: true },
      orderBy: { id: 'asc' },
    });

    return rows.map(row => ({ id: row.id, name: row.tipo }));
  }

  async getResearchGroups(): Promise<ResearchGroupLookupDto[]> {
    const rows = await this.prisma.grupo_pesquisa.findMany({
      select: {
        id: true,
        titulo: true,
        grupo_pesquisa_linhas: {
          select: { linha: true },
          orderBy: { linha: 'asc' },
        },
      },
      orderBy: { titulo: 'asc' },
    });

    return rows.map(row => ({
      id: row.id,
      name: row.titulo,
      linhas: row.grupo_pesquisa_linhas.map(item => item.linha),
    }));
  }

  getMemberLookups(): ResearchMemberLookupsDto {
    return {
      funcoes: this.mappedEnumLookup(TipoMembroProjetoMapper),
      categorias: [
        { id: CategoriaMembroProjeto.DOCENTE, name: 'Docente' },
        { id: CategoriaMembroProjeto.DISCENTE, name: 'Discente' },
        {
          id: CategoriaMembroProjeto.TECNICO_ADMINISTRATIVO,
          name: 'Servidor técnico-administrativo',
        },
        { id: CategoriaMembroProjeto.EXTERNO, name: 'Externo' },
      ],
      tipos_externos: this.mappedEnumLookup(TipoMembroExternoMapper),
      formacoes_externas: this.mappedEnumLookup(MembroExternoFormacaoMapper),
      sexos: this.mappedEnumLookup(TipoSexoMapper),
    };
  }

  async getUsersLookup(query: ResearchUserLookupQueryDto): Promise<ResearchUserLookupDto[]> {
    const categoria = query.categoria ?? query.funcao;
    if (categoria === CategoriaMembroProjeto.EXTERNO) return [];

    const categoryWhere: Prisma.usuarioWhereInput = {};
    if (categoria === CategoriaMembroProjeto.DOCENTE) {
      categoryWhere.OR = [
        { docente: { some: {} } },
        { funcao: { nome: { in: ['DOCENTE', 'COORDENADOR'], mode: 'insensitive' } } },
      ];
    } else if (categoria === CategoriaMembroProjeto.DISCENTE) {
      categoryWhere.OR = [
        { discente: { some: {} } },
        { funcao: { nome: { in: ['DISCENTE', 'ALUNO'], mode: 'insensitive' } } },
      ];
    } else if (categoria === CategoriaMembroProjeto.TECNICO_ADMINISTRATIVO) {
      categoryWhere.funcao = {
        nome: { in: ['TECNICO_ADMINISTRATIVO', 'GESTOR'], mode: 'insensitive' },
      };
    }

    const searchWhere: Prisma.usuarioWhereInput = query.search
      ? {
          OR: [
            { nome: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const rows = await this.prisma.usuario.findMany({
      where: { AND: [categoryWhere, searchWhere] },
      select: {
        id: true,
        nome: true,
        email: true,
        funcao: { select: { nome: true } },
        docente: { select: { id: true }, take: 1 },
        discente: { select: { id: true }, take: 1 },
      },
      orderBy: { nome: 'asc' },
      take: 50,
    });

    return rows.map(row => ({
      id: row.id,
      name: row.nome,
      email: row.email,
      categoria: this.resolveMemberCategory(row),
    }));
  }

  async uploadAttachment(
    id: number,
    file: UploadedResearchFile | undefined,
  ): Promise<ResearchAttachmentResponseDto> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Arquivo do projeto não informado.');
    }

    if (!this.isPdfFile(file)) {
      throw new BadRequestException('Apenas arquivos PDF são permitidos.');
    }

    await this.assertResearchExists(id);
    const attachmentName = this.normalizeAttachmentName(file.originalname);

    return this.prisma.anexo_projeto_pesquisa.upsert({
      where: { projeto_pesquisa_id: id },
      create: {
        projeto_pesquisa_id: id,
        arquivo: Uint8Array.from(file.buffer),
        nome: attachmentName,
        tipo: file.mimetype || 'application/pdf',
      },
      update: {
        arquivo: Uint8Array.from(file.buffer),
        nome: attachmentName,
        tipo: file.mimetype || 'application/pdf',
      },
      select: { id: true, projeto_pesquisa_id: true, nome: true, tipo: true },
    });
  }

  async getAttachment(
    id: number,
    currentUser: CurrentUserPayload,
  ): Promise<{ arquivo: Buffer; nome: string; tipo: string }> {
    await this.membership.assertCanAccessPesquisa(currentUser, id);

    const attachment = await this.prisma.anexo_projeto_pesquisa.findUnique({
      where: { projeto_pesquisa_id: id },
      select: { arquivo: true, nome: true, tipo: true },
    });

    if (!attachment) {
      throw new NotFoundException(`O projeto de pesquisa com ID ${id} não possui PDF associado.`);
    }

    return {
      arquivo: Buffer.from(attachment.arquivo),
      nome: attachment.nome,
      tipo: attachment.tipo,
    };
  }

  async findAll(
    limit: number,
    offset: number,
    user?: CurrentUserPayload,
  ): Promise<PaginatedResult<findOneResearchDto>> {
    const where: Prisma.projeto_pesquisaWhereInput = {};

    if (user) {
      const allowedIds = await this.membership.buildAllowedPesquisaIds(user);
      if (allowedIds !== null) {
        where.id = { in: allowedIds };
      }
    }

    const [data, total] = await Promise.all([
      (
        await this.prisma.projeto_pesquisa.findMany({
          where,
          include: {
            corpo_projeto: true,
            palavra_chave: true,
            objetivos: { include: { objetivo: true } },
            categoria: true,
          },
          take: limit,
          skip: offset,
          orderBy: { data_cadastro: 'desc' },
        })
      ).map(research => {
        return this.formatResearch(research);
      }),
      this.prisma.projeto_pesquisa.count({ where }),
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
            objetivos: { include: { objetivo: true } },
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
            objetivos: { include: { objetivo: true } },
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
        membros: {
          where: { ativo: true },
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
                funcao: { select: { nome: true } },
                docente: { select: { id: true }, take: 1 },
                discente: { select: { id: true }, take: 1 },
              },
            },
            funcao_projeto: { select: { nome: true } },
          },
        },
        projetoMembros: {
          include: {
            user: {
              select: {
                nome: true,
                email: true,
                funcao: { select: { nome: true } },
                docente: { select: { id: true }, take: 1 },
                discente: { select: { id: true }, take: 1 },
              },
            },
          },
        },
        projetoMembroExternos: true,
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

    if (Array.isArray(updateResearchDto.palavras_chave_ids)) {
      await this.assertPalavrasChaveExist(updateResearchDto.palavras_chave_ids);
    }

    if (Array.isArray(updateResearchDto.pesquisa_objetivo_ids)) {
      await this.assertObjetivosSustentavelExist(updateResearchDto.pesquisa_objetivo_ids);
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
        ...(Array.isArray(updateResearchDto.atividades) && {
          atividades: {
            deleteMany: {},
            create: updateResearchDto.atividades.map(atividade => ({
              descricao: atividade.descricao,
              meses: {
                create: atividade.meses.map(mes => ({ data: new Date(mes.data) })),
              },
            })),
          },
        }),
        ...(updateResearchDto.corpo_projeto !== undefined && {
          corpo_projeto: {
            update: updateResearchDto.corpo_projeto,
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
      objetivos:
        research?.objetivos
          ?.filter(item => Boolean(item.objetivo))
          .map(item => ({
            id: item.objetivo.id,
            name: item.objetivo.tipo,
          })) ?? [],
      atividades: research?.atividades?.map(atividade => {
        return {
          descricao: atividade.descricao,
          meses: atividade.meses.map(mes => {
            return mes.data;
          }),
        };
      }),
    };

    if (full && research.corpo_projeto) {
      formatted_research.corpo = {
        resumo: research.corpo_projeto.resumo,
        abstract: research.corpo_projeto.abstract,
        introducao: research.corpo_projeto.introducao,
        objetivos: research.corpo_projeto.objetivos,
        metodologia: research.corpo_projeto.metodologia,
        resultados_esperados: research.corpo_projeto.resultados_esperados,
        referencias: research.corpo_projeto.referencias,
      };
    }

    if (full) {
      formatted_research.unidade = research.unidade_academica
        ? `${research.unidade_academica.sigla} — ${research.unidade_academica.nome}`
        : undefined;
      formatted_research.membros = [
        ...(research.membros ?? []).map(member => {
          const categoria = this.resolveMemberCategory(member.usuario);
          return {
            id: member.id,
            nome: member.usuario.nome,
            email: member.usuario.email,
            funcao: member.funcao_projeto.nome,
            categoria: this.memberCategoryLabel(categoria),
          };
        }),
        ...(research.projetoMembros ?? []).map(member => {
          const categoria = this.resolveMemberCategory(member.user);
          return {
            id: member.id,
            nome: member.user.nome,
            email: member.user.email,
            funcao: TipoMembroProjetoMapper[member.funcao],
            categoria: this.memberCategoryLabel(categoria),
            carga_horaria: member.ch_dedicadas,
          };
        }),
        ...(research.projetoMembroExternos ?? []).map(member => ({
          id: member.id,
          nome: member.nome,
          email: member.email,
          funcao: TipoMembroProjetoMapper[member.funcao],
          categoria: 'Externo',
          carga_horaria: member.ch_dedicada,
          cpf: member.cpf ?? undefined,
          sexo: TipoSexoMapper[member.sexo],
          formacao: MembroExternoFormacaoMapper[member.formacao],
          tipo: TipoMembroExternoMapper[member.tipo],
        })),
      ];
      formatted_research.anexo = research.anexo_projeto_pesquisa
        ? {
            id: research.anexo_projeto_pesquisa.id,
            nome: research.anexo_projeto_pesquisa.nome,
            tipo: research.anexo_projeto_pesquisa.tipo,
          }
        : undefined;
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

  private async assertEditalExists(
    editalId: number,
  ): Promise<{ id: number; categoria_id: number }> {
    const edital = await this.prisma.edital.findUnique({
      where: { id: editalId },
      select: { id: true, categoria_id: true },
    });

    if (!edital) {
      throw new NotFoundException(`Edital com id ${editalId} não encontrado`);
    }

    return edital;
  }

  private async assertKnowledgeAreaExists(areaId: number): Promise<void> {
    const area = await this.prisma.area_conhecimento.findUnique({
      where: { id: areaId },
      select: { id: true },
    });

    if (!area) {
      throw new NotFoundException(`Área de conhecimento com id ${areaId} não encontrada`);
    }
  }

  private async assertResearchGroupExists(groupId: number): Promise<void> {
    const group = await this.prisma.grupo_pesquisa.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundException(`Grupo de pesquisa com id ${groupId} não encontrado`);
    }
  }

  private async assertResearchExists(id: number): Promise<void> {
    const project = await this.prisma.projeto_pesquisa.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException(`Projeto de pesquisa Id ${id} não encontrado`);
    }
  }

  private normalizeKeywords(values: string[] | undefined): string[] {
    return [...new Set((values ?? []).map(value => value.trim()).filter(Boolean))];
  }

  private assertProjectDates(dataInicio: Date | undefined, dataFim: Date | undefined): void {
    if (dataInicio && dataFim && new Date(dataFim).getTime() < new Date(dataInicio).getTime()) {
      throw new BadRequestException(
        'A data final do projeto não pode ser anterior à data inicial.',
      );
    }
  }

  private mappedEnumLookup<T extends string>(mapper: Record<T, string>): ResearchLookupDto<T>[] {
    return (Object.entries(mapper) as [T, string][]).map(([id, name]) => ({ id, name }));
  }

  private isPdfFile(file: UploadedResearchFile): boolean {
    const hasPdfMimeType = file.mimetype === 'application/pdf';
    const hasPdfExtension = file.originalname?.toLowerCase().endsWith('.pdf') ?? false;
    const hasPdfSignature = file.buffer?.subarray(0, 4).toString('utf8') === '%PDF';

    return hasPdfMimeType && hasPdfExtension && hasPdfSignature;
  }

  private normalizeAttachmentName(originalName?: string): string {
    const fileName = originalName
      ?.split(/[\\/]/)
      .pop()
      ?.replace(/[\r\n"]/g, '')
      .trim();
    return (fileName || 'projeto.pdf').slice(0, 255);
  }

  private resolveMemberCategory(row: {
    funcao: { nome: string };
    docente: { id: number }[];
    discente: { id: number }[];
  }): CategoriaMembroProjeto {
    if (
      row.docente.length > 0 ||
      ['DOCENTE', 'COORDENADOR'].includes(row.funcao.nome.toUpperCase())
    ) {
      return CategoriaMembroProjeto.DOCENTE;
    }
    if (row.discente.length > 0 || ['DISCENTE', 'ALUNO'].includes(row.funcao.nome.toUpperCase())) {
      return CategoriaMembroProjeto.DISCENTE;
    }
    return CategoriaMembroProjeto.TECNICO_ADMINISTRATIVO;
  }

  private memberCategoryLabel(categoria: CategoriaMembroProjeto): string {
    const labels: Record<CategoriaMembroProjeto, string> = {
      [CategoriaMembroProjeto.DOCENTE]: 'Docente',
      [CategoriaMembroProjeto.DISCENTE]: 'Discente',
      [CategoriaMembroProjeto.TECNICO_ADMINISTRATIVO]: 'Servidor técnico-administrativo',
      [CategoriaMembroProjeto.EXTERNO]: 'Externo',
    };
    return labels[categoria];
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

  private async assertCategoria(id: number): Promise<void> {
    const categoria = await this.prisma.categoria_edital.findUnique({ where: { id: id } });

    if (!categoria) {
      throw new NotFoundException(`Categoria id ${id} não existente`);
    }
  }

  private async assertUsersExist(ids: number[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    const users = await this.prisma.usuario.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    const foundIds = new Set(users.map(user => user.id));
    const missingIds = uniqueIds.filter(id => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Usuário(s) não encontrado(s) para os ids: ${missingIds.join(', ')}`,
      );
    }
  }
}
