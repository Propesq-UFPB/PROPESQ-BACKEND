import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  StatusIndicacaoPlano,
  StatusInteressePlano,
  TipoIndicacao,
} from '@prisma/client';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { ConfirmIndicacaoDto } from './dto/confirm-indicacao.dto';
import { CreateInteresseDto } from './dto/create-interesse.dto';
import { CandidatoDetalheDto } from './dto/candidato-detalhe.dto';
import { InteresseResponseDto } from './dto/interesse-response.dto';
import { CreateWorkPlanDto } from './dto/create-work-plan.dto';
import {
  UpdateActivityWorkPlanDto,
  UpdateBodyWorkPlanDto,
  UpdateMonthWorkPlanDto,
  UpdateWorkPlanDto,
} from './dto/update-work-plan.dto';
import {
  CandidatoResumoDto,
  WorkPlanIndicacaoItemDto,
} from './dto/work-plan-indicacao-item.dto';
import { WorkPlanIndicacaoDetalheDto } from './dto/work-plan-indicacao-detalhe.dto';
import { WorkPlanIndicacoesQueryDto } from './dto/work-plan-indicacoes-query.dto';
import { WorkPlanListQueryDto } from './dto/work-plan-list-query.dto';
import { WorkPlanAccessService } from './work-plan-access.service';

const indicacaoInclude = {
  corpo_plano_trabalho: true,
  discente: { include: { usuario: true, perfil: true } },
  dados_bancarios: true,
  interesses: {
    include: {
      discente: { include: { usuario: true, perfil: true } },
    },
    orderBy: { criado_em: 'asc' as const },
  },
  projeto_pesquisa: {
    include: {
      area_conhecimento: true,
      edital_rel: {
        include: {
          periodo_execucao_rel: true,
        },
      },
    },
  },
} satisfies Prisma.plano_trabalhoInclude;

type PlanoIndicacaoRow = Prisma.plano_trabalhoGetPayload<{
  include: typeof indicacaoInclude;
}>;

const STATUS_PERMITE_INDICACAO: StatusIndicacaoPlano[] = [
  StatusIndicacaoPlano.PENDENTE_INDICACAO,
  StatusIndicacaoPlano.INDICACAO_RECUSADA,
];

function normalizeModalidade(modalidade: string): string {
  return modalidade
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function isTipoIndicacaoAllowed(modalidade: string, tipo: TipoIndicacao): boolean {
  const m = normalizeModalidade(modalidade);
  const hasVoluntario = m.includes('voluntario');
  const hasBolsista = m.includes('bolsista');
  if (hasVoluntario && hasBolsista) {
    return true;
  }
  if (hasVoluntario && !hasBolsista) {
    return tipo === TipoIndicacao.VOLUNTARIO;
  }
  if (hasBolsista && !hasVoluntario) {
    return tipo === TipoIndicacao.BOLSISTA;
  }
  return true;
}

@Injectable()
export class WorkPlanService {
  constructor(
    private prisma: PrismaService,
    private access: WorkPlanAccessService,
  ) {}

  async create(createWorkPlanDto: CreateWorkPlanDto, user: CurrentUserPayload) {
    const projeto = await this.prisma.projeto_pesquisa.findUnique({
      where: { id: createWorkPlanDto.pesquisa_id },
    });

    if (!projeto) {
      throw new NotFoundException(
        `Projeto de pesquisa com ID ${createWorkPlanDto.pesquisa_id} não encontrado`,
      );
    }

    await this.access.assertCanAccessPesquisa(user, createWorkPlanDto.pesquisa_id, {
      forceMemberScope: true,
    });

    const workPlan = await this.prisma.$transaction(async tx => {
      const createdWorkPlan = await tx.plano_trabalho.create({
        data: {
          pesquisa_id: createWorkPlanDto.pesquisa_id,
          modalidade: createWorkPlanDto.modalidade,
          status: createWorkPlanDto.status,
          tipo_bolsa: createWorkPlanDto.tipo_bolsa,
          direcionamento_plano: createWorkPlanDto.direcionamento_plano,
          usuario_id: user.userId,
        },
        include: this.defaultInclude(),
      });

      const body = await tx.corpo_plano_trabalho.create({
        data: {
          ...createWorkPlanDto.corpo_plano_trabalho,
          plano_trabalho_id: createdWorkPlan.id,
        },
      });

      await tx.plano_trabalho.update({
        where: { id: createdWorkPlan.id },
        data: { corpo_id: body.id },
      });

      await this.syncActivitiesWithSql(createdWorkPlan.id, createWorkPlanDto.atividades, tx);

      return createdWorkPlan;
    });

    return this.findOne(workPlan.id);
  }

  async findAll(
    query: WorkPlanListQueryDto,
    user?: CurrentUserPayload,
  ): Promise<PaginatedResult<unknown>> {
    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;

    const where: Prisma.plano_trabalhoWhereInput = {};

    if (query.pesquisa_id !== undefined) {
      where.pesquisa_id = query.pesquisa_id;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }
    if (query.status_indicacao !== undefined) {
      where.status_indicacao = query.status_indicacao;
    }

    if (user) {
      const scope = await this.access.buildScopeWhere(user);
      if (scope) {
        Object.assign(where, scope);
      } else if (query.usuario_id !== undefined) {
        where.usuario_id = query.usuario_id;
      }
    } else if (query.usuario_id !== undefined) {
      where.usuario_id = query.usuario_id;
    }

    const [rawData, total] = await Promise.all([
      this.prisma.plano_trabalho.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { id: 'desc' },
        include: this.defaultInclude(),
      }),
      this.prisma.plano_trabalho.count({ where }),
    ]);

    const data = await this.attachActivitiesAndMonths(rawData);

    return {
      total,
      limit,
      offset,
      results: data,
    };
  }

  async findOne(id: number, user?: CurrentUserPayload) {
    if (user) {
      await this.access.assertCanAccessPlan(user, id);
    }

    const rawWorkPlan = await this.prisma.plano_trabalho.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });

    if (!rawWorkPlan) {
      throw new NotFoundException(`Plano de trabalho com ID ${id} não encontrado`);
    }

    const [workPlan] = await this.attachActivitiesAndMonths([rawWorkPlan]);

    return workPlan;
  }

  async findIndicacoes(
    query: WorkPlanIndicacoesQueryDto,
    user: CurrentUserPayload,
  ): Promise<PaginatedResult<WorkPlanIndicacaoItemDto>> {
    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;

    const where = await this.buildIndicacoesWhere(query, user);

    const [rows, total] = await Promise.all([
      this.prisma.plano_trabalho.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { id: 'desc' },
        include: indicacaoInclude,
      }),
      this.prisma.plano_trabalho.count({ where }),
    ]);

    return {
      total,
      limit,
      offset,
      results: rows.map(row => this.mapToIndicacaoItem(row)),
    };
  }

  async findIndicacaoById(
    id: number,
    user: CurrentUserPayload,
  ): Promise<WorkPlanIndicacaoDetalheDto> {
    await this.access.assertCanAccessPlan(user, id, { forceMemberScope: true });

    const row = await this.prisma.plano_trabalho.findUnique({
      where: { id },
      include: indicacaoInclude,
    });

    if (!row) {
      throw new NotFoundException(`Plano de trabalho com ID ${id} não encontrado`);
    }

    return this.mapToIndicacaoDetalhe(row);
  }

  async confirmIndicacao(
    id: number,
    dto: ConfirmIndicacaoDto,
    user: CurrentUserPayload,
  ): Promise<WorkPlanIndicacaoDetalheDto> {
    await this.access.assertCanAccessPlan(user, id, { forceMemberScope: true });

    const plan = await this.prisma.plano_trabalho.findUnique({
      where: { id },
      include: { dados_bancarios: true },
    });

    if (!plan) {
      throw new NotFoundException(`Plano de trabalho com ID ${id} não encontrado`);
    }

    if (!STATUS_PERMITE_INDICACAO.includes(plan.status_indicacao)) {
      throw new ConflictException(
        `Não é possível indicar neste plano com status ${plan.status_indicacao}.`,
      );
    }

    if (plan.prazo_indicacao) {
      const prazo = new Date(plan.prazo_indicacao);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      prazo.setHours(0, 0, 0, 0);
      if (prazo < today) {
        throw new BadRequestException('O prazo de indicação deste plano já encerrou.');
      }
    }

    const interesse = await this.prisma.interesse_plano_trabalho.findUnique({
      where: { id: dto.interesse_id },
    });

    if (!interesse || interesse.plano_trabalho_id !== id) {
      throw new NotFoundException(
        `Interesse ${dto.interesse_id} não encontrado neste plano.`,
      );
    }

    if (interesse.status !== StatusInteressePlano.APTO_PARA_INDICACAO) {
      throw new BadRequestException(
        'Só é possível indicar candidatos com status APTO_PARA_INDICACAO.',
      );
    }

    if (!isTipoIndicacaoAllowed(plan.modalidade, dto.tipo_indicacao)) {
      throw new BadRequestException(
        `tipo_indicacao ${dto.tipo_indicacao} incompatível com a modalidade "${plan.modalidade}".`,
      );
    }

    if (dto.tipo_indicacao === TipoIndicacao.BOLSISTA) {
      if (
        !dto.dados_bancarios?.banco?.trim() ||
        !dto.dados_bancarios?.agencia?.trim() ||
        !dto.dados_bancarios?.conta?.trim()
      ) {
        throw new BadRequestException(
          'Dados bancários (banco, agencia, conta) são obrigatórios para indicação BOLSISTA.',
        );
      }
    }

    await this.prisma.$transaction(async tx => {
      await tx.plano_trabalho.update({
        where: { id },
        data: {
          discente_id: interesse.discente_id,
          tipo_indicacao: dto.tipo_indicacao,
          status_indicacao: StatusIndicacaoPlano.AGUARDANDO_VALIDACAO,
        },
      });

      if (dto.tipo_indicacao === TipoIndicacao.BOLSISTA && dto.dados_bancarios) {
        await tx.dados_bancarios_indicacao.upsert({
          where: { plano_trabalho_id: id },
          create: {
            plano_trabalho_id: id,
            usuario_id: user.userId,
            banco: dto.dados_bancarios.banco.trim(),
            agencia: dto.dados_bancarios.agencia.trim(),
            conta: dto.dados_bancarios.conta.trim(),
          },
          update: {
            usuario_id: user.userId,
            banco: dto.dados_bancarios.banco.trim(),
            agencia: dto.dados_bancarios.agencia.trim(),
            conta: dto.dados_bancarios.conta.trim(),
          },
        });
      } else {
        await tx.dados_bancarios_indicacao.deleteMany({
          where: { plano_trabalho_id: id },
        });
      }
    });

    return this.findIndicacaoById(id, user);
  }

  async createInteresse(
    planoId: number,
    dto: CreateInteresseDto,
    user: CurrentUserPayload,
  ): Promise<InteresseResponseDto> {
    const plan = await this.prisma.plano_trabalho.findUnique({
      where: { id: planoId },
      select: { id: true },
    });

    if (!plan) {
      throw new NotFoundException(`Plano de trabalho com ID ${planoId} não encontrado`);
    }

    const role = user.funcao?.toUpperCase();
    let discenteId: number;

    if (role === 'ADMIN' || role === 'GESTOR') {
      if (dto.discente_id === undefined) {
        throw new BadRequestException('Informe discente_id.');
      }
      discenteId = dto.discente_id;
    } else {
      const discenteDoUsuario = await this.prisma.discente.findFirst({
        where: { usuario_id: user.userId },
      });
      if (!discenteDoUsuario) {
        throw new NotFoundException(
          'Não há registro de discente vinculado ao usuário autenticado.',
        );
      }
      discenteId = discenteDoUsuario.id;
    }

    const discente = await this.prisma.discente.findUnique({
      where: { id: discenteId },
    });
    if (!discente) {
      throw new NotFoundException(`Discente com ID ${discenteId} não encontrado`);
    }

    const existing = await this.prisma.interesse_plano_trabalho.findUnique({
      where: {
        plano_trabalho_id_discente_id: {
          plano_trabalho_id: planoId,
          discente_id: discenteId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Já existe interesse registrado deste discente neste plano.',
      );
    }

    const created = await this.prisma.interesse_plano_trabalho.create({
      data: {
        plano_trabalho_id: planoId,
        discente_id: discenteId,
        status: StatusInteressePlano.INTERESSE_REGISTRADO,
      },
    });

    return {
      id: created.id,
      plano_trabalho_id: created.plano_trabalho_id,
      discente_id: created.discente_id,
      status: created.status,
      criado_em: created.criado_em.toISOString(),
    };
  }

  async listInteresses(
    planoId: number,
    user: CurrentUserPayload,
  ): Promise<InteresseResponseDto[]> {
    await this.access.assertCanAccessPlan(user, planoId, { forceMemberScope: true });

    const plan = await this.prisma.plano_trabalho.findUnique({
      where: { id: planoId },
      select: { id: true },
    });
    if (!plan) {
      throw new NotFoundException(`Plano de trabalho com ID ${planoId} não encontrado`);
    }

    const rows = await this.prisma.interesse_plano_trabalho.findMany({
      where: { plano_trabalho_id: planoId },
      orderBy: { criado_em: 'asc' },
    });

    return rows.map(row => ({
      id: row.id,
      plano_trabalho_id: row.plano_trabalho_id,
      discente_id: row.discente_id,
      status: row.status,
      criado_em: row.criado_em.toISOString(),
    }));
  }

  async update(id: number, updateWorkPlanDto: UpdateWorkPlanDto, user?: CurrentUserPayload) {
    if (user) {
      await this.access.assertCanAccessPlan(user, id, { forceMemberScope: true });
    }

    const workPlan = await this.findOne(id);

    if (updateWorkPlanDto.pesquisa_id) {
      await this.validateForeignKeys(
        updateWorkPlanDto.pesquisa_id ?? workPlan.pesquisa_id ?? workPlan.projeto_pesquisa?.id,
      );
      if (user) {
        await this.access.assertCanAccessPesquisa(user, updateWorkPlanDto.pesquisa_id, {
          forceMemberScope: true,
        });
      }
    }

    await this.prisma.$transaction(async tx => {
      await tx.plano_trabalho.update({
        where: { id },
        data: {
          ...(updateWorkPlanDto.pesquisa_id !== undefined && {
            pesquisa_id: updateWorkPlanDto.pesquisa_id,
          }),
          ...(updateWorkPlanDto.modalidade !== undefined && {
            modalidade: updateWorkPlanDto.modalidade,
          }),
          ...(updateWorkPlanDto.status !== undefined && {
            status: updateWorkPlanDto.status,
          }),
          ...(updateWorkPlanDto.tipo_bolsa !== undefined && {
            tipo_bolsa: updateWorkPlanDto.tipo_bolsa,
          }),
          ...(updateWorkPlanDto.direcionamento_plano !== undefined && {
            direcionamento_plano: updateWorkPlanDto.direcionamento_plano,
          }),
        },
      });

      if (updateWorkPlanDto.corpo_plano_trabalho) {
        await this.syncBodyPlan(tx, id, workPlan.corpo_id, updateWorkPlanDto.corpo_plano_trabalho);
      }

      if (Array.isArray(updateWorkPlanDto.atividades)) {
        await this.syncActivitiesWithSql(id, updateWorkPlanDto.atividades, tx);
      }
    });

    return this.findOne(id);
  }

  async remove(id: number, user?: CurrentUserPayload) {
    if (user) {
      await this.access.assertCanAccessPlan(user, id, { forceMemberScope: true });
    }

    await this.findOne(id);

    return this.prisma.plano_trabalho.delete({
      where: { id },
      include: this.defaultInclude(),
    });
  }

  private async buildIndicacoesWhere(
    query: WorkPlanIndicacoesQueryDto,
    user: CurrentUserPayload,
  ): Promise<Prisma.plano_trabalhoWhereInput> {
    const parts: Prisma.plano_trabalhoWhereInput[] = [
      this.access.buildElegibilidadeWhere(),
    ];

    const scope = await this.access.buildScopeWhere(user, { forceMemberScope: true });
    if (scope) {
      parts.push(scope);
    }

    if (query.pesquisa_id !== undefined) {
      parts.push({ pesquisa_id: query.pesquisa_id });
    }
    if (query.edital_id !== undefined) {
      parts.push({ projeto_pesquisa: { edital_id: query.edital_id } });
    }
    if (query.status_indicacao !== undefined) {
      parts.push({ status_indicacao: query.status_indicacao });
    }
    if (query.q?.trim()) {
      const term = query.q.trim();
      parts.push({
        OR: [
          { corpo_plano_trabalho: { titulo: { contains: term, mode: 'insensitive' } } },
          { projeto_pesquisa: { titulo: { contains: term, mode: 'insensitive' } } },
        ],
      });
    }

    return { AND: parts };
  }

  private mapToIndicacaoItem(row: PlanoIndicacaoRow): WorkPlanIndicacaoItemDto {
    const base = this.mapIndicacaoBase(row);
    const candidatos = row.interesses.map(interesse =>
      this.mapCandidatoResumo(interesse),
    );

    let alunoIndicado: CandidatoResumoDto | null = null;
    if (row.discente_id) {
      const fromInteresse = candidatos.find(c => c.discente_id === row.discente_id);
      if (fromInteresse) {
        alunoIndicado = fromInteresse;
      } else if (row.discente?.usuario) {
        alunoIndicado = {
          id: 0,
          discente_id: row.discente.id,
          usuario_id: row.discente.usuario_id,
          nome: row.discente.usuario.nome,
          email: row.discente.usuario.email,
          matricula: row.discente.matricula ?? null,
          curso: row.discente.perfil?.curso ?? null,
          interesse_em: '',
          status_interesse: StatusInteressePlano.INTERESSE_REGISTRADO,
        };
      }
    }

    return {
      ...base,
      aluno_indicado: alunoIndicado,
      candidatos,
      total_candidatos: candidatos.length,
    };
  }

  private mapToIndicacaoDetalhe(row: PlanoIndicacaoRow): WorkPlanIndicacaoDetalheDto {
    const base = this.mapIndicacaoBase(row);
    const candidatos = row.interesses.map(interesse =>
      this.mapCandidatoDetalhe(interesse),
    );

    let alunoIndicado: CandidatoDetalheDto | null = null;
    if (row.discente_id) {
      const fromInteresse = candidatos.find(c => c.discente_id === row.discente_id);
      if (fromInteresse) {
        alunoIndicado = fromInteresse;
      } else if (row.discente?.usuario) {
        alunoIndicado = this.mapDiscenteToCandidatoDetalhe(row.discente, {
          id: 0,
          criado_em: new Date(0),
          status: StatusInteressePlano.INTERESSE_REGISTRADO,
        });
      }
    }

    return {
      ...base,
      aluno_indicado: alunoIndicado,
      candidatos,
      total_candidatos: candidatos.length,
    };
  }

  private mapIndicacaoBase(row: PlanoIndicacaoRow) {
    const edital = row.projeto_pesquisa.edital_rel;
    const periodo = edital?.periodo_execucao_rel;
    const vigenciaInicio =
      row.projeto_pesquisa.data_inicio ?? periodo?.inicio ?? null;
    const vigenciaFim = row.projeto_pesquisa.data_fim ?? periodo?.fim ?? null;
    const anoSource = vigenciaInicio ?? periodo?.inicio ?? null;

    return {
      id: row.id,
      pesquisa_id: row.pesquisa_id,
      projeto_titulo: row.projeto_pesquisa.titulo,
      plano_titulo: row.corpo_plano_trabalho?.titulo ?? null,
      edital: {
        id: edital?.id ?? null,
        codigo: edital?.codigo ?? null,
        descricao: edital?.descricao ?? null,
      },
      ano: anoSource ? String(new Date(anoSource).getFullYear()) : null,
      area: row.projeto_pesquisa.area_conhecimento?.area ?? null,
      modalidade: row.modalidade,
      vagas: row.vagas,
      carga_horaria: row.carga_horaria,
      status_indicacao: row.status_indicacao as StatusIndicacaoPlano,
      aprovado_em: null as string | null,
      vigencia_inicio: vigenciaInicio ? new Date(vigenciaInicio).toISOString() : null,
      vigencia_fim: vigenciaFim ? new Date(vigenciaFim).toISOString() : null,
      prazo_indicacao: row.prazo_indicacao
        ? new Date(row.prazo_indicacao).toISOString()
        : null,
      prazo_substituicao: row.prazo_substituicao
        ? new Date(row.prazo_substituicao).toISOString()
        : null,
      status_termo_compromisso: row.status_termo_compromisso,
      tipo_indicacao: row.tipo_indicacao,
      dados_bancarios: row.dados_bancarios
        ? {
            banco: row.dados_bancarios.banco,
            agencia: row.dados_bancarios.agencia,
            conta: row.dados_bancarios.conta,
          }
        : null,
    };
  }

  private mapCandidatoResumo(
    interesse: PlanoIndicacaoRow['interesses'][number],
  ): CandidatoResumoDto {
    return {
      id: interesse.id,
      discente_id: interesse.discente_id,
      usuario_id: interesse.discente.usuario_id,
      nome: interesse.discente.usuario.nome,
      email: interesse.discente.usuario.email,
      matricula: interesse.discente.matricula ?? null,
      curso: interesse.discente.perfil?.curso ?? null,
      interesse_em: interesse.criado_em.toISOString(),
      status_interesse: interesse.status,
    };
  }

  private mapCandidatoDetalhe(
    interesse: PlanoIndicacaoRow['interesses'][number],
  ): CandidatoDetalheDto {
    return this.mapDiscenteToCandidatoDetalhe(interesse.discente, {
      id: interesse.id,
      criado_em: interesse.criado_em,
      status: interesse.status,
    });
  }

  private mapDiscenteToCandidatoDetalhe(
    discente: PlanoIndicacaoRow['interesses'][number]['discente'],
    meta: { id: number; criado_em: Date; status: StatusInteressePlano },
  ): CandidatoDetalheDto {
    const perfil = discente.perfil;
    const email = discente.usuario.email;

    return {
      id: meta.id,
      discente_id: discente.id,
      usuario_id: discente.usuario_id,
      nome: discente.usuario.nome,
      email,
      matricula: discente.matricula ?? null,
      curso: perfil?.curso ?? null,
      interesse_em: meta.criado_em.getTime() === 0 ? '' : meta.criado_em.toISOString(),
      status_interesse: meta.status,
      lattes_url: discente.lattes_url ?? null,
      data_nascimento: perfil?.data_nascimento
        ? new Date(perfil.data_nascimento).toISOString()
        : null,
      sexo: perfil?.sexo ?? null,
      raca: perfil?.raca ?? null,
      estado_civil: perfil?.estado_civil ?? null,
      nacionalidade: perfil?.nacionalidade ?? null,
      naturalidade: perfil?.naturalidade ?? null,
      tipo_sanguineo: perfil?.tipo_sanguineo ?? null,
      nome_pai: perfil?.nome_pai ?? null,
      nome_mae: perfil?.nome_mae ?? null,
      documentos: perfil
        ? {
            cpf: perfil.cpf,
            rg: perfil.rg,
            rg_emissao: perfil.rg_emissao
              ? new Date(perfil.rg_emissao).toISOString()
              : null,
            orgao_emissor: perfil.orgao_emissor,
            titulo_eleitor: perfil.titulo_eleitor,
            zona_eleitoral: perfil.zona_eleitoral,
            secao_eleitoral: perfil.secao_eleitoral,
            certificado_militar: perfil.certificado_militar,
            categoria_militar: perfil.categoria_militar,
          }
        : null,
      endereco: perfil
        ? {
            cep: perfil.cep,
            tipo_logradouro: perfil.tipo_logradouro,
            logradouro: perfil.logradouro,
            numero: perfil.numero,
            complemento: perfil.complemento,
            bairro: perfil.bairro,
            uf: perfil.uf,
            cidade: perfil.cidade,
            pais: perfil.pais,
          }
        : null,
      contato: {
        telefone_ddd: perfil?.telefone_ddd ?? null,
        telefone: perfil?.telefone ?? null,
        celular_ddd: perfil?.celular_ddd ?? null,
        celular: perfil?.celular ?? null,
        email,
      },
      academico: perfil
        ? {
            curso: perfil.curso,
            campus: perfil.campus,
            periodo: perfil.periodo,
            semestre: perfil.semestre,
            cra: perfil.cra != null ? String(perfil.cra) : null,
            creditos_concluidos: perfil.creditos_concluidos,
            reprovacoes: perfil.reprovacoes,
            situacao_academica: perfil.situacao_academica,
            situacao_matricula: perfil.situacao_matricula,
          }
        : null,
      necessidade_especifica: perfil
        ? {
            possui: perfil.possui_necessidade,
            tipo: perfil.tipo_necessidade,
          }
        : null,
    };
  }

  private async validateForeignKeys(
    discente_id: number,
    pesquisa_id?: number,
    usuario_id?: number,
  ) {
    const [discente, usuario, projeto] = await Promise.all([
      this.prisma.discente.findUnique({ where: { id: discente_id } }),
      usuario_id ? this.prisma.usuario.findUnique({ where: { id: usuario_id } }) : null,
      pesquisa_id
        ? this.prisma.projeto_pesquisa.findUnique({
            where: { id: pesquisa_id },
          })
        : Promise.resolve(null),
    ]);

    if (!discente) {
      throw new NotFoundException(`Discente com ID ${discente_id} não encontrado`);
    }

    if (usuario_id && !usuario) {
      throw new NotFoundException(`Usuário com ID ${usuario_id} não encontrado`);
    }

    if (pesquisa_id && !projeto) {
      throw new NotFoundException(`Projeto de pesquisa com ID ${pesquisa_id} não encontrado`);
    }

    return discente;
  }

  private async syncBodyPlan(
    tx: Prisma.TransactionClient,
    workPlanId: number,
    corpoId: number,
    bodyDto: UpdateBodyWorkPlanDto,
  ) {
    const existingBody = await tx.corpo_plano_trabalho.findUnique({
      where: { id: corpoId },
    });

    if (existingBody) {
      await tx.corpo_plano_trabalho.update({
        where: { id: corpoId },
        data: {
          ...(bodyDto.titulo !== undefined && { titulo: bodyDto.titulo }),
          ...(bodyDto.introducao !== undefined && {
            introducao: bodyDto.introducao,
          }),
          ...(bodyDto.objetivos !== undefined && {
            objetivos: bodyDto.objetivos,
          }),
          ...(bodyDto.metodologia !== undefined && {
            metodologia: bodyDto.metodologia,
          }),
          ...(bodyDto.referencias !== undefined && {
            referencias: bodyDto.referencias,
          }),
        },
      });

      return;
    }

    const fullBody = this.ensureBodyFields(bodyDto);
    if (!fullBody) {
      throw new BadRequestException(
        'Para criar corpo_plano_trabalho, envie todos os campos obrigatórios.',
      );
    }

    await tx.corpo_plano_trabalho.create({
      data: {
        ...fullBody,
        plano_trabalho_id: workPlanId,
      },
    });
  }

  private async syncActivitiesWithSql(
    workPlanId: number,
    atividadesDto: UpdateActivityWorkPlanDto[],
    tx: Prisma.TransactionClient | PrismaService,
  ) {
    const existingActivities = await tx.$queryRawUnsafe<Array<{ id: number }>>(
      'SELECT id FROM atividade_plano_trabalho WHERE plano_trabalho_id = $1',
      workPlanId,
    );

    const existingActivityIds = existingActivities.map(atividade => atividade.id);
    const incomingExistingIds = atividadesDto
      .filter(atividade => atividade.id !== undefined)
      .map(atividade => atividade.id as number);

    const invalidActivityIds = incomingExistingIds.filter(
      atividadeId => !existingActivityIds.includes(atividadeId),
    );

    if (invalidActivityIds.length > 0) {
      throw new NotFoundException(
        `Atividade(s) do plano não encontrada(s): ${invalidActivityIds.join(', ')}`,
      );
    }

    if (incomingExistingIds.length === 0) {
      await tx.$executeRawUnsafe(
        'DELETE FROM atividade_plano_trabalho WHERE plano_trabalho_id = $1',
        workPlanId,
      );
    } else {
      await tx.$executeRawUnsafe(
        'DELETE FROM atividade_plano_trabalho WHERE plano_trabalho_id = $1 AND id <> ALL($2::int[])',
        workPlanId,
        incomingExistingIds,
      );
    }

    for (const atividadeDto of atividadesDto) {
      if (atividadeDto.id) {
        if (atividadeDto.descricao !== undefined) {
          await tx.$executeRawUnsafe(
            'UPDATE atividade_plano_trabalho SET descricao = $1 WHERE id = $2',
            atividadeDto.descricao,
            atividadeDto.id,
          );
        }

        if (Array.isArray(atividadeDto.meses)) {
          await this.syncMonthsWithSql(tx, atividadeDto.id, atividadeDto.meses);
        }

        continue;
      }

      if (!atividadeDto.descricao) {
        throw new BadRequestException(
          'O campo descricao é obrigatório ao criar uma nova atividade.',
        );
      }

      const insertedActivity = await tx.$queryRawUnsafe<Array<{ id: number }>>(
        'INSERT INTO atividade_plano_trabalho (descricao, plano_trabalho_id) VALUES ($1, $2) RETURNING id',
        atividadeDto.descricao,
        workPlanId,
      );

      const activityId = insertedActivity[0]?.id;
      if (!activityId) {
        throw new BadRequestException('Não foi possível criar a atividade do plano.');
      }

      if (Array.isArray(atividadeDto.meses)) {
        await this.syncMonthsWithSql(tx, activityId, atividadeDto.meses);
      }
    }
  }

  private async syncMonthsWithSql(
    tx: Prisma.TransactionClient | PrismaService,
    activityId: number,
    monthsDto: UpdateMonthWorkPlanDto[],
  ) {
    const existingMonths = await tx.$queryRawUnsafe<Array<{ id: number }>>(
      'SELECT id FROM mes_plano_trabalho WHERE atividade_id = $1',
      activityId,
    );

    const existingMonthIds = existingMonths.map(mes => mes.id);
    const incomingExistingIds = monthsDto
      .filter(mes => mes.id !== undefined)
      .map(mes => mes.id as number);

    const invalidMonthIds = incomingExistingIds.filter(
      monthId => !existingMonthIds.includes(monthId),
    );

    if (invalidMonthIds.length > 0) {
      throw new NotFoundException(
        `Mês(es) da atividade não encontrado(s): ${invalidMonthIds.join(', ')}`,
      );
    }

    if (incomingExistingIds.length === 0) {
      await tx.$executeRawUnsafe(
        'DELETE FROM mes_plano_trabalho WHERE atividade_id = $1',
        activityId,
      );
    } else {
      await tx.$executeRawUnsafe(
        'DELETE FROM mes_plano_trabalho WHERE atividade_id = $1 AND id <> ALL($2::int[])',
        activityId,
        incomingExistingIds,
      );
    }

    for (const monthDto of monthsDto) {
      if (monthDto.id) {
        if (monthDto.data === undefined) {
          continue;
        }

        await tx.$executeRawUnsafe(
          'UPDATE mes_plano_trabalho SET data = $1 WHERE id = $2',
          new Date(monthDto.data),
          monthDto.id,
        );

        continue;
      }

      if (!monthDto.data) {
        throw new BadRequestException('O campo data é obrigatório ao criar um novo mês.');
      }

      await tx.$executeRawUnsafe(
        'INSERT INTO mes_plano_trabalho (data, atividade_id) VALUES ($1, $2)',
        new Date(monthDto.data),
        activityId,
      );
    }
  }

  private ensureBodyFields(bodyDto: UpdateBodyWorkPlanDto) {
    if (
      !bodyDto.titulo ||
      !bodyDto.introducao ||
      !bodyDto.objetivos ||
      !bodyDto.metodologia ||
      !bodyDto.referencias
    ) {
      return null;
    }

    return {
      titulo: bodyDto.titulo,
      introducao: bodyDto.introducao,
      objetivos: bodyDto.objetivos,
      metodologia: bodyDto.metodologia,
      referencias: bodyDto.referencias,
    };
  }

  private defaultInclude() {
    return {
      corpo_plano_trabalho: true,
      discente: true,
      usuario: true,
      projeto_pesquisa: {
        include: {
          edital_rel: {
            include: {
              periodo_execucao_rel: true,
            },
          },
          area_conhecimento: true,
        },
      },
    };
  }

  private async attachActivitiesAndMonths<T extends { id: number }>(plans: T[]): Promise<any[]> {
    if (plans.length === 0) {
      return plans;
    }

    const planIds = plans.map(plan => plan.id);
    const activities = await this.prisma.$queryRawUnsafe<
      Array<{ id: number; descricao: string; plano_trabalho_id: number }>
    >(
      'SELECT id, descricao, plano_trabalho_id FROM atividade_plano_trabalho WHERE plano_trabalho_id = ANY($1::int[]) ORDER BY id ASC',
      planIds,
    );

    const activityIds = activities.map(activity => activity.id);
    const months =
      activityIds.length > 0
        ? await this.prisma.$queryRawUnsafe<
            Array<{ id: number; data: Date; atividade_id: number }>
          >(
            'SELECT id, data, atividade_id FROM mes_plano_trabalho WHERE atividade_id = ANY($1::int[]) ORDER BY id ASC',
            activityIds,
          )
        : [];

    const monthsByActivity = new Map<number, Array<{ id: number; data: Date }>>();
    for (const month of months) {
      const current = monthsByActivity.get(month.atividade_id) ?? [];
      current.push({ id: month.id, data: month.data });
      monthsByActivity.set(month.atividade_id, current);
    }

    const activitiesByPlan = new Map<
      number,
      Array<{
        id: number;
        descricao: string;
        meses: Array<{ id: number; data: Date }>;
      }>
    >();
    for (const activity of activities) {
      const current = activitiesByPlan.get(activity.plano_trabalho_id) ?? [];
      current.push({
        id: activity.id,
        descricao: activity.descricao,
        meses: monthsByActivity.get(activity.id) ?? [],
      });
      activitiesByPlan.set(activity.plano_trabalho_id, current);
    }

    return plans.map(plan => ({
      ...plan,
      atividades: activitiesByPlan.get(plan.id) ?? [],
    }));
  }
}
