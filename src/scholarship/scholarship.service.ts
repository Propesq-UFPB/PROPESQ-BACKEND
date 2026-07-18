import { Injectable, NotFoundException } from '@nestjs/common';
import { bolsa, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { CreateScholarshipFromSettingsDto } from './dto/create-scholarship-from-settings.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { ScholarshipResponseDto } from './dto/scholarship-response.dto';
import { ScholarshipLookupDto } from './dto/scholarship-lookup.dto';

type BolsaWithOrgao = bolsa & {
  orgao: { id: number; nome: string } | null;
};

const bolsaInclude = {
  orgao: { select: { id: true, nome: true } },
} satisfies Prisma.bolsaInclude;

@Injectable()
export class ScholarshipService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateScholarshipDto): Promise<ScholarshipResponseDto> {
    if (createDto.orgao_id != null) {
      await this.ensureOrgaoExists(createDto.orgao_id);
    }

    const created = await this.prisma.bolsa.create({
      data: this.toPrismaCreateData(createDto),
      include: bolsaInclude,
    });
    return this.toResponseDto(created);
  }

  async createFromSettings(
    createDto: CreateScholarshipFromSettingsDto,
  ): Promise<ScholarshipResponseDto> {
    await this.ensureOrgaoExists(createDto.orgao_id);

    const year = new Date().getFullYear();
    const created = await this.prisma.bolsa.create({
      data: {
        descricao: createDto.descricao.trim(),
        categoria: createDto.descricao.trim(),
        dia_limite_indicacao: 15,
        dia_limite_finalizacao: 20,
        niveis: '111',
        vinculado_cota: false,
        necessita_relatorio: false,
        necessidade_dados_bancarios: false,
        possui_bancos_exclusivos: false,
        possui_tipo_conta_excls: false,
        envio_relatorio_inicio: new Date(`${year}-01-01`),
        envio_relatorio_fim: new Date(`${year}-12-31`),
        orgao_id: createDto.orgao_id,
        valor:
          createDto.valor === undefined || createDto.valor === null
            ? null
            : new Prisma.Decimal(createDto.valor),
        permite_acumulo: createDto.permite_acumulo ?? false,
      },
      include: bolsaInclude,
    });

    return this.toResponseDto(created);
  }

  async findAll(limit: number, offset: number): Promise<PaginatedResult<ScholarshipResponseDto>> {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.bolsa.count(),
      this.prisma.bolsa.findMany({
        take: limit,
        skip: offset,
        orderBy: { id: 'asc' },
        include: bolsaInclude,
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: rows.map(row => this.toResponseDto(row)),
    };
  }

  async getLookup(): Promise<ScholarshipLookupDto[]> {
    const rows = await this.prisma.bolsa.findMany({
      select: { id: true, descricao: true },
      orderBy: { descricao: 'asc' },
    });

    return rows.map(row => ({ id: row.id, descricao: row.descricao }));
  }

  async findOne(id: number): Promise<ScholarshipResponseDto> {
    const scholarship = await this.prisma.bolsa.findUnique({
      where: { id },
      include: bolsaInclude,
    });

    if (!scholarship) {
      throw new NotFoundException(`Bolsa com id ${id} não encontrada.`);
    }

    return this.toResponseDto(scholarship);
  }

  async update(id: number, updateDto: UpdateScholarshipDto): Promise<ScholarshipResponseDto> {
    await this.findOne(id);

    if (updateDto.orgao_id != null) {
      await this.ensureOrgaoExists(updateDto.orgao_id);
    }

    const updated = await this.prisma.bolsa.update({
      where: { id },
      data: this.toPrismaUpdateData(updateDto),
      include: bolsaInclude,
    });

    return this.toResponseDto(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.bolsa.delete({
      where: { id },
    });
  }

  private async ensureOrgaoExists(orgaoId: number): Promise<void> {
    const orgao = await this.prisma.orgao_financiador.findUnique({
      where: { id: orgaoId },
      select: { id: true },
    });

    if (!orgao) {
      throw new NotFoundException(`Órgão financiador com id ${orgaoId} não encontrado.`);
    }
  }

  private toPrismaCreateData(dto: CreateScholarshipDto): Prisma.bolsaCreateInput {
    return {
      descricao: dto.descricao,
      categoria: dto.categoria,
      dia_limite_indicacao: dto.dia_limite_indicacao,
      dia_limite_finalizacao: dto.dia_limite_finalizacao,
      niveis: dto.niveis,
      vinculado_cota: dto.vinculado_cota,
      necessita_relatorio: dto.necessita_relatorio,
      necessidade_dados_bancarios: dto.necessidade_dados_bancarios,
      possui_bancos_exclusivos: dto.possui_bancos_exclusivos,
      possui_tipo_conta_excls: dto.possui_tipo_conta_excls,
      envio_relatorio_inicio: new Date(dto.envio_relatorio_inicio),
      envio_relatorio_fim: new Date(dto.envio_relatorio_fim),
      permite_acumulo: dto.permite_acumulo ?? false,
      valor: dto.valor === undefined || dto.valor === null ? null : new Prisma.Decimal(dto.valor),
      ...(dto.orgao_id != null ? { orgao: { connect: { id: dto.orgao_id } } } : {}),
    };
  }

  private toPrismaUpdateData(dto: UpdateScholarshipDto): Prisma.bolsaUpdateInput {
    const {
      envio_relatorio_inicio,
      envio_relatorio_fim,
      orgao_id,
      valor,
      permite_acumulo,
      ...rest
    } = dto;

    return {
      ...rest,
      ...(envio_relatorio_inicio !== undefined && {
        envio_relatorio_inicio: new Date(envio_relatorio_inicio),
      }),
      ...(envio_relatorio_fim !== undefined && {
        envio_relatorio_fim: new Date(envio_relatorio_fim),
      }),
      ...(permite_acumulo !== undefined && { permite_acumulo }),
      ...(valor !== undefined && {
        valor: valor === null ? null : new Prisma.Decimal(valor),
      }),
      ...(orgao_id !== undefined &&
        (orgao_id === null
          ? { orgao: { disconnect: true } }
          : { orgao: { connect: { id: orgao_id } } })),
    };
  }

  private toResponseDto(scholarship: BolsaWithOrgao): ScholarshipResponseDto {
    return {
      id: scholarship.id,
      descricao: scholarship.descricao,
      categoria: scholarship.categoria,
      dia_limite_indicacao: scholarship.dia_limite_indicacao,
      dia_limite_finalizacao: scholarship.dia_limite_finalizacao,
      niveis: scholarship.niveis,
      vinculado_cota: scholarship.vinculado_cota,
      necessita_relatorio: scholarship.necessita_relatorio,
      necessidade_dados_bancarios: scholarship.necessidade_dados_bancarios,
      possui_bancos_exclusivos: scholarship.possui_bancos_exclusivos,
      possui_tipo_conta_excls: scholarship.possui_tipo_conta_excls,
      envio_relatorio_inicio: scholarship.envio_relatorio_inicio.toISOString().slice(0, 10),
      envio_relatorio_fim: scholarship.envio_relatorio_fim.toISOString().slice(0, 10),
      orgao_id: scholarship.orgao_id,
      valor: scholarship.valor === null ? null : Number(scholarship.valor),
      permite_acumulo: scholarship.permite_acumulo,
      orgao: scholarship.orgao ? { id: scholarship.orgao.id, nome: scholarship.orgao.nome } : null,
    };
  }
}
