import { Injectable, NotFoundException } from '@nestjs/common';
import { bolsa } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { ScholarshipResponseDto } from './dto/scholarship-response.dto';
import { ScholarshipLookupDto } from './dto/scholarship-lookup.dto';

@Injectable()
export class ScholarshipService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateScholarshipDto): Promise<ScholarshipResponseDto> {
    const created = await this.prisma.bolsa.create({
      data: this.toPrismaCreateData(createDto),
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
    });

    if (!scholarship) {
      throw new NotFoundException(`Bolsa com id ${id} não encontrada.`);
    }

    return this.toResponseDto(scholarship);
  }

  async update(id: number, updateDto: UpdateScholarshipDto): Promise<ScholarshipResponseDto> {
    await this.findOne(id);

    const updated = await this.prisma.bolsa.update({
      where: { id },
      data: this.toPrismaUpdateData(updateDto),
    });

    return this.toResponseDto(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.bolsa.delete({
      where: { id },
    });
  }

  private toPrismaCreateData(dto: CreateScholarshipDto) {
    return {
      ...dto,
      envio_relatorio_inicio: new Date(dto.envio_relatorio_inicio),
      envio_relatorio_fim: new Date(dto.envio_relatorio_fim),
    };
  }

  private toPrismaUpdateData(dto: UpdateScholarshipDto) {
    const { envio_relatorio_inicio, envio_relatorio_fim, ...rest } = dto;

    return {
      ...rest,
      ...(envio_relatorio_inicio !== undefined && {
        envio_relatorio_inicio: new Date(envio_relatorio_inicio),
      }),
      ...(envio_relatorio_fim !== undefined && {
        envio_relatorio_fim: new Date(envio_relatorio_fim),
      }),
    };
  }

  private toResponseDto(scholarship: bolsa): ScholarshipResponseDto {
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
    };
  }
}
