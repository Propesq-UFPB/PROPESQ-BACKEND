import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatusRelatorio, relatorio } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportResponseDto } from './dto/report-response.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportDto): Promise<ReportResponseDto> {
    await this.ensureProjectExists(dto.projeto_pesquisa_id);

    const status = dto.status ?? StatusRelatorio.PENDENTE;
    const created = await this.prisma.relatorio.create({
      data: {
        projeto_pesquisa_id: dto.projeto_pesquisa_id,
        tipo: dto.tipo,
        status,
        prazo_fim: new Date(dto.prazo_fim),
        enviado_em:
          status === StatusRelatorio.PENDENTE ? null : new Date(),
      },
    });

    return this.toResponseDto(created);
  }

  async findAll(
    limit: number,
    offset: number,
    status?: StatusRelatorio,
  ): Promise<PaginatedResult<ReportResponseDto>> {
    const where: Prisma.relatorioWhereInput = status ? { status } : {};

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.relatorio.count({ where }),
      this.prisma.relatorio.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { prazo_fim: 'asc' },
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: rows.map(row => this.toResponseDto(row)),
    };
  }

  async findOne(id: number): Promise<ReportResponseDto> {
    const report = await this.prisma.relatorio.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Relatório com id ${id} não encontrado.`);
    }
    return this.toResponseDto(report);
  }

  async update(id: number, dto: UpdateReportDto): Promise<ReportResponseDto> {
    const current = await this.prisma.relatorio.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Relatório com id ${id} não encontrado.`);
    }

    const nextStatus = dto.status ?? current.status;
    const updated = await this.prisma.relatorio.update({
      where: { id },
      data: {
        ...(dto.tipo !== undefined && { tipo: dto.tipo }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.prazo_fim !== undefined && { prazo_fim: new Date(dto.prazo_fim) }),
        ...(dto.status !== undefined &&
          dto.status !== StatusRelatorio.PENDENTE &&
          current.enviado_em === null && { enviado_em: new Date() }),
        ...(nextStatus === StatusRelatorio.PENDENTE && { enviado_em: null }),
      },
    });

    return this.toResponseDto(updated);
  }

  private async ensureProjectExists(id: number): Promise<void> {
    const project = await this.prisma.projeto_pesquisa.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Projeto com id ${id} não encontrado.`);
    }
  }

  private toResponseDto(row: relatorio): ReportResponseDto {
    return {
      id: row.id,
      projeto_pesquisa_id: row.projeto_pesquisa_id,
      tipo: row.tipo,
      status: row.status,
      prazo_fim: row.prazo_fim.toISOString().slice(0, 10),
      enviado_em: row.enviado_em?.toISOString() ?? null,
      criado_em: row.criado_em.toISOString(),
    };
  }
}
