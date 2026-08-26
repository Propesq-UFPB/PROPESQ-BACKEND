import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEditalDto } from './dto/create-edital.dto';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { UpdateEditalDto } from './dto/update-edital.dto';
import { Prisma, StatusEdital, TipoEdital } from '@prisma/client';
import { TipoEditalMapper } from '../common/mapper/tipo-edital.mapper';
import { EditalTypeLookupDto } from './dto/edital-type-lookup.dto';
import { EditalAttachmentResponseDto } from './dto/edital-attachment-response.dto';
import { EditalLookupDto } from './dto/edital-lookup.dto';
import { EditalStatusLookupDto } from './dto/edital-status-lookup.dto';
import { StatusEditalMapper } from '../common/mapper/status-edital.mapper';
import { EditalListItemDto } from './dto/edital-list-item.dto';

type UploadedEditalFile = {
  buffer?: Buffer;
  mimetype?: string;
  originalname?: string;
};

@Injectable()
export class EditalService {
  constructor(private readonly prisma: PrismaService) {}

  getTypeLookup(): EditalTypeLookupDto[] {
    return Object.values(TipoEdital).map(tipo => ({
      id: tipo,
      name: TipoEditalMapper[tipo],
    }));
  }

  getStatusLookup(): EditalStatusLookupDto[] {
    return Object.values(StatusEdital).map(status => ({
      id: status,
      name: StatusEditalMapper[status],
    }));
  }

  async getLookup(): Promise<EditalLookupDto[]> {
    const rows = await this.prisma.edital.findMany({
      select: {
        id: true,
        codigo: true,
        descricao: true,
      },
      orderBy: [{ data_cadastro: 'desc' }, { id: 'desc' }],
    });

    return rows.map(row => ({
      id: row.id,
      codigo: row.codigo,
      descricao: row.descricao,
      name: row.codigo ? `${row.codigo} - ${row.descricao}` : row.descricao,
    }));
  }

  async create(createEditalDto: CreateEditalDto) {
    await this.assertEditalExistsByCodigo(createEditalDto.codigo);

    return this.prisma.edital.create({
      data: {
        data_cadastro: new Date(),
        codigo: createEditalDto.codigo,
        descricao: createEditalDto.descricao,
        status: createEditalDto.status,
        ano: createEditalDto.ano,
        titulacao_min: createEditalDto.titulacao_min,
        tipo: createEditalDto.tipo,
        limite_solicitacoes_orientador: createEditalDto.limite_solicitacoes_orientador,
        limite_planos_orientador: createEditalDto.limite_planos_orientador,
        avaliacao_vigente: createEditalDto.avaliacao_vigente,
        apenas_orient_coordena_plano: createEditalDto.apenas_orient_coordena_plano,
        tec_admin_coord_proj: createEditalDto.tec_admin_coord_proj,
        divulgar_resultado: createEditalDto.divulgar_resultado,
        edital_para_voluntarios: createEditalDto.edital_para_voluntarios,
        apenas_colab_vol_cadastra_plano: createEditalDto.apenas_colab_vol_cadastra_plano,
        prof_subst_cadastra_proj: createEditalDto.prof_subst_cadastra_proj,
        categoria: {
          connect: {
            id: createEditalDto.categoria_id,
          },
        },
        edital_cota_distribuicao: {
          createMany: {
            data: createEditalDto.edital_cota_distribuicao ?? [],
          },
        },
        periodo_submissoes: {
          create: {
            inicio: createEditalDto.periodo_submissao.inicio,
            fim: createEditalDto.periodo_submissao.fim,
          },
        },
        periodo_execucao_rel: {
          create: {
            inicio: createEditalDto.periodo_execucao.inicio,
            fim: createEditalDto.periodo_execucao.fim,
          },
        },
        cota_bolsa: {
          connect: {
            id: createEditalDto.cota_bolsa_id,
          },
        },
      },
    });
  }

  async uploadAttachment(
    id: number,
    file: UploadedEditalFile | undefined,
  ): Promise<EditalAttachmentResponseDto> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Arquivo do edital não informado.');
    }

    if (!this.isPdfFile(file)) {
      throw new BadRequestException('Apenas arquivos PDF são permitidos.');
    }

    await this.assertEditalExists(id);
    const arquivo = Uint8Array.from(file.buffer);
    const nome = this.generateAttachmentName(file.originalname);
    const tipo = 'pdf';

    return this.prisma.anexo_edital.upsert({
      where: { edital_id: id },
      create: {
        edital_id: id,
        nome,
        arquivo,
        tipo,
      },
      update: {
        nome,
        arquivo,
        tipo,
      },
      select: {
        id: true,
        edital_id: true,
        nome: true,
        tipo: true,
      },
    });
  }

  async getAttachment(id: number): Promise<{
    nome: string;
    tipo: string;
    arquivo: Buffer;
  }> {
    await this.assertEditalExists(id);

    const anexo = await this.prisma.anexo_edital.findUnique({
      where: { edital_id: id },
      select: {
        nome: true,
        tipo: true,
        arquivo: true,
      },
    });

    if (!anexo) {
      throw new NotFoundException(`Anexo do edital ${id} não encontrado`);
    }

    return {
      nome: anexo.nome,
      tipo: anexo.tipo,
      arquivo: Buffer.from(anexo.arquivo),
    };
  }

  async findMany(
    limit: number,
    offset: number,
    search?: string,
  ): Promise<PaginatedResult<EditalListItemDto>> {
    const where = this.buildSearchWhere(search);

    const [editais, total] = await Promise.all([
      this.prisma.edital.findMany({
        ...(where && { where }),
        select: {
          id: true,
          descricao: true,
          status: true,
          periodo_execucao_rel: {
            select: {
              inicio: true,
              fim: true,
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.edital.count(where ? { where } : undefined),
    ]);

    return {
      limit,
      offset,
      total,
      results: editais.map(edital => this.formatEdital(edital)),
    };
  }

  private formatEdital(edital: {
    id: number;
    descricao: string;
    status: StatusEdital;
    periodo_execucao_rel: { inicio: Date; fim: Date };
  }): EditalListItemDto {
    return {
      id: edital.id,
      titulo: edital.descricao,
      periodo_execucao: `${this.formatDate(edital.periodo_execucao_rel.inicio)} a ${this.formatDate(edital.periodo_execucao_rel.fim)}`,
      status: edital.status,
    };
  }

  async delete(id: number) {
    const edital = await this.prisma.edital.findUnique({ where: { id: id } });

    if (!edital) {
      throw new NotFoundException(`Edital ID ${id} não encontrado`);
    }

    return this.prisma.edital.delete({ where: { id: id } });
  }

  async findOne(id: number) {
    const edital = await this.prisma.edital.findUnique({
      where: { id: id },
      select: {
        id: true,
        codigo: true,
        descricao: true,
        status: true,
        ano: true,
        titulacao_min: true,
        tipo: true,
        limite_solicitacoes_orientador: true,
        limite_planos_orientador: true,
        avaliacao_vigente: true,
        apenas_orient_coordena_plano: true,
        tec_admin_coord_proj: true,
        divulgar_resultado: true,
        edital_para_voluntarios: true,
        apenas_colab_vol_cadastra_plano: true,
        prof_subst_cadastra_proj: true,
        categoria: {
          select: {
            id: true,
            denominacao: true,
          },
        },
        periodo_submissoes: {
          select: {
            id: true,
            inicio: true,
            fim: true,
          },
        },
        periodo_execucao_rel: {
          select: {
            id: true,
            inicio: true,
            fim: true,
          },
        },
        edital_cota_distribuicao: true,
        cota_bolsa: {
          select: {
            id: true,
            codigo: true,
            descricao: true,
          },
        },
        anexo: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
        edital_unidade_academica: {
          select: { unidade_id: true },
        },
      },
    });

    if (!edital) {
      throw new NotFoundException(`Edital com ID ${id} não encontrado`);
    }

    const { edital_unidade_academica, anexo, ...rest } = edital;

    return {
      ...rest,
      anexo: anexo ?? null,
      unidade_ids: edital_unidade_academica.map(row => row.unidade_id),
    };
  }

  async setAcademicUnits(id: number, unidadeIds: number[]): Promise<void> {
    await this.findOne(id);

    if (unidadeIds.length > 0) {
      const units = await this.prisma.unidade_academica.findMany({
        where: { id: { in: unidadeIds } },
        select: { id: true },
      });

      if (units.length !== unidadeIds.length) {
        const found = new Set(units.map(unit => unit.id));
        const missing = unidadeIds.filter(unitId => !found.has(unitId));
        throw new NotFoundException(
          `Unidade(s) acadêmica(s) não encontrada(s): ${missing.join(', ')}.`,
        );
      }
    }

    await this.prisma.$transaction([
      this.prisma.edital_unidade_academica.deleteMany({ where: { edital_id: id } }),
      ...(unidadeIds.length
        ? [
            this.prisma.edital_unidade_academica.createMany({
              data: unidadeIds.map(unidade_id => ({
                edital_id: id,
                unidade_id,
              })),
            }),
          ]
        : []),
    ]);
  }

  async update(id: number, updateEditalDto: UpdateEditalDto) {
    await this.findOne(id);
    await this.assertEditalExistsByCodigo(updateEditalDto.codigo, id);

    if (updateEditalDto.edital_cota_distribuicao !== undefined) {
      await this.prisma.edital_cota_distribuicao.deleteMany({
        where: { id_edital: id },
      });
    }

    await this.prisma.edital.update({
      where: { id },
      data: this.buildUpdateData(updateEditalDto),
    });
  }

  private buildUpdateData(dto: UpdateEditalDto): Prisma.editalUpdateInput {
    const periodoExecucao = this.normalizeExecutionPeriod(dto.periodo_execucao);
    const periodoSubmissao = this.normalizeExecutionPeriod(dto.periodo_submissao);

    return this.omitUndefined({
      descricao: dto.descricao ?? dto.titulo,
      codigo: this.optionalCodigo(dto.codigo),
      status: dto.status,
      titulacao_min: dto.titulacao_min,
      tipo: dto.tipo,
      limite_solicitacoes_orientador: dto.limite_solicitacoes_orientador,
      limite_planos_orientador: dto.limite_planos_orientador,
      avaliacao_vigente: dto.avaliacao_vigente,
      apenas_orient_coordena_plano: dto.apenas_orient_coordena_plano,
      tec_admin_coord_proj: dto.tec_admin_coord_proj,
      divulgar_resultado: dto.divulgar_resultado,
      edital_para_voluntarios: dto.edital_para_voluntarios,
      apenas_colab_vol_cadastra_plano: dto.apenas_colab_vol_cadastra_plano,
      prof_subst_cadastra_proj: dto.prof_subst_cadastra_proj,
      ano: dto.ano,
      categoria: this.connectById(dto.categoria_id),
      cota_bolsa: this.connectById(dto.cota_bolsa_id),
      periodo_execucao_rel: this.periodoUpdate(periodoExecucao),
      periodo_submissoes: this.periodoUpdate(periodoSubmissao),
      edital_cota_distribuicao: this.cotaCreateMany(dto.edital_cota_distribuicao),
    });
  }

  private omitUndefined(
    fields: Prisma.editalUpdateInput,
  ): Prisma.editalUpdateInput {
    return Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    ) as Prisma.editalUpdateInput;
  }

  private optionalCodigo(codigo: string | undefined): string | null | undefined {
    if (codigo === undefined) return undefined;
    return codigo || null;
  }

  private connectById(id: number | undefined) {
    if (id === undefined) return undefined;
    return { connect: { id } };
  }

  private periodoUpdate(
    periodo: { inicio?: Date; fim?: Date } | undefined,
  ) {
    if (!periodo) return undefined;
    return { update: { data: periodo } };
  }

  private cotaCreateMany(
    rows: UpdateEditalDto['edital_cota_distribuicao'],
  ) {
    if (rows === undefined) return undefined;
    return { createMany: { data: rows } };
  }

  // Verifica se código já existe, se sim, existe um conflito
  async assertEditalExistsByCodigo(codigo: string | undefined, id?: number): Promise<void> {
    if (!codigo) return;

    const edital = await this.prisma.edital.findUnique({ where: { codigo: codigo } });

    if (edital && edital.id != id) {
      throw new ConflictException(`Edital com código ${codigo} já existe`);
    }
  }

  private async assertEditalExists(id: number): Promise<void> {
    const edital = await this.prisma.edital.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!edital) {
      throw new NotFoundException(`Edital com ID ${id} não encontrado`);
    }
  }

  private isPdfFile(file: UploadedEditalFile): boolean {
    const hasPdfMimeType = file.mimetype === 'application/pdf';
    const hasPdfExtension = file.originalname?.toLowerCase().endsWith('.pdf') ?? false;
    const hasPdfSignature = file.buffer?.subarray(0, 4).toString('utf8') === '%PDF';

    return hasPdfMimeType && hasPdfExtension && hasPdfSignature;
  }

  private generateAttachmentName(originalName = 'edital.pdf'): string {
    const randomSuffix = randomBytes(8).toString('hex');
    const maxOriginalNameLength = 255 - randomSuffix.length - 1;
    const normalizedOriginalName = originalName.slice(0, maxOriginalNameLength);

    return `${normalizedOriginalName}-${randomSuffix}`;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }

  private buildSearchWhere(search?: string): Prisma.editalWhereInput | undefined {
    const term = search?.trim();
    if (!term) return undefined;

    const normalizedTerm = this.normalizeSearchTerm(term);
    const matchingStatuses = Object.values(StatusEdital).filter(status =>
      [status, StatusEditalMapper[status]].some(value =>
        this.normalizeSearchTerm(value).includes(normalizedTerm),
      ),
    );

    return {
      OR: [
        {
          descricao: {
            contains: term,
            mode: 'insensitive',
          },
        },
        ...(matchingStatuses.length > 0
          ? [
              {
                status: {
                  in: matchingStatuses,
                },
              },
            ]
          : []),
      ],
    };
  }

  private normalizeSearchTerm(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('pt-BR');
  }

  private normalizeExecutionPeriod(period?: {
    inicio?: string;
    fim?: string;
  }): { inicio?: Date; fim?: Date } | undefined {
    if (!period) return undefined;

    const normalized = {
      ...(period.inicio !== undefined && {
        inicio: this.toPrismaDate(period.inicio),
      }),
      ...(period.fim !== undefined && {
        fim: this.toPrismaDate(period.fim),
      }),
    };

    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  private toPrismaDate(value: string): Date {
    const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value;

    return new Date(normalizedValue);
  }

  async findEvaluationAssignments(editalId: number) {
    const edital = await this.prisma.edital.findUnique({ where: { id: editalId } });
    if (!edital) {
      throw new NotFoundException('Edital não encontrado');
    }
    return this.prisma.projeto_avaliacao.findMany({
      where: { projeto_pesquisa: { edital_id: editalId } },
      include: {
        avaliador: {
          select: {
            id: true,
            nome: true,
            email: true,
            funcao_id: true,
            funcao: true,
            criado_em: true,
            atualizado_em: true,
          },
        },
        projeto_pesquisa: true,
        notas: {
          include: { criterio_avaliacao: true },
        },
        planos_avaliacao: {
          include: {
            plano_trabalho: true,
            notas: {
              include: { criterio_avaliacao: true },
            },
          },
        },
      },
    });
  }
}
