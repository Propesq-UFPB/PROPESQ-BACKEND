import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { orgao_financiador, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { CreateFundingAgencyDto } from './dto/create-funding-agency.dto';
import { UpdateFundingAgencyDto } from './dto/update-funding-agency.dto';
import { FundingAgencyResponseDto } from './dto/funding-agency-response.dto';
import { FundingAgencyLookupDto } from './dto/funding-agency-lookup.dto';

@Injectable()
export class FundingAgencyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateFundingAgencyDto): Promise<FundingAgencyResponseDto> {
    try {
      const created = await this.prisma.orgao_financiador.create({
        data: { nome: createDto.nome.trim() },
      });
      return this.toResponseDto(created);
    } catch (error) {
      this.rethrowUniqueConflict(error, createDto.nome);
      throw error;
    }
  }

  async findAll(limit: number, offset: number): Promise<PaginatedResult<FundingAgencyResponseDto>> {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.orgao_financiador.count(),
      this.prisma.orgao_financiador.findMany({
        take: limit,
        skip: offset,
        orderBy: { nome: 'asc' },
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: rows.map(row => this.toResponseDto(row)),
    };
  }

  async getLookup(): Promise<FundingAgencyLookupDto[]> {
    const rows = await this.prisma.orgao_financiador.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });

    return rows.map(row => ({ id: row.id, name: row.nome }));
  }

  async findOne(id: number): Promise<FundingAgencyResponseDto> {
    const agency = await this.prisma.orgao_financiador.findUnique({
      where: { id },
    });

    if (!agency) {
      throw new NotFoundException(`Órgão financiador com id ${id} não encontrado.`);
    }

    return this.toResponseDto(agency);
  }

  async update(id: number, updateDto: UpdateFundingAgencyDto): Promise<FundingAgencyResponseDto> {
    await this.findOne(id);

    try {
      const updated = await this.prisma.orgao_financiador.update({
        where: { id },
        data: {
          ...(updateDto.nome !== undefined && { nome: updateDto.nome.trim() }),
        },
      });
      return this.toResponseDto(updated);
    } catch (error) {
      this.rethrowUniqueConflict(error, updateDto.nome);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const inUse = await this.prisma.bolsa.findFirst({
      where: { orgao_id: id },
      select: { id: true },
    });

    if (inUse) {
      throw new ConflictException(
        'Não é possível excluir o órgão: existem tipos de bolsa associados.',
      );
    }

    await this.prisma.orgao_financiador.delete({
      where: { id },
    });
  }

  private rethrowUniqueConflict(error: unknown, nome?: string): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException(
        nome
          ? `Já existe um órgão financiador com o nome "${nome}".`
          : 'Já existe um órgão financiador com esse nome.',
      );
    }
  }

  private toResponseDto(agency: orgao_financiador): FundingAgencyResponseDto {
    return {
      id: agency.id,
      nome: agency.nome,
      criado_em: agency.criado_em.toISOString(),
      atualizado_em: agency.atualizado_em.toISOString(),
    };
  }
}
