import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { criterio_avaliacao, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { CreateEvaluationCriterionDto } from './dto/create-evaluation-criterion.dto';
import { UpdateEvaluationCriterionDto } from './dto/update-evaluation-criterion.dto';
import { EvaluationCriterionResponseDto } from './dto/evaluation-criterion-response.dto';
import { EvaluationCriterionLookupDto } from './dto/evaluation-criterion-lookup.dto';

@Injectable()
export class EvaluationCriteriaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateEvaluationCriterionDto): Promise<EvaluationCriterionResponseDto> {
    try {
      const created = await this.prisma.criterio_avaliacao.create({
        data: {
          nome: createDto.nome,
          descricao: createDto.descricao,
          peso: createDto.peso,
          nota_maxima: createDto.nota_maxima,
          ativo: createDto.ativo ?? true,
        },
      });

      return this.toResponseDto(created);
    } catch (error) {
      this.handleUniqueNomeConflict(error, createDto.nome);
      throw error;
    }
  }

  async findAll(
    limit: number,
    offset: number,
    ativo?: boolean,
  ): Promise<PaginatedResult<EvaluationCriterionResponseDto>> {
    const where: Prisma.criterio_avaliacaoWhereInput = ativo !== undefined ? { ativo } : {};

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.criterio_avaliacao.count({ where }),
      this.prisma.criterio_avaliacao.findMany({
        where,
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

  async getLookup(): Promise<EvaluationCriterionLookupDto[]> {
    const rows = await this.prisma.criterio_avaliacao.findMany({
      where: { ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });

    return rows.map(row => ({ id: row.id, name: row.nome }));
  }

  async findOne(id: number): Promise<EvaluationCriterionResponseDto> {
    const criterion = await this.prisma.criterio_avaliacao.findUnique({
      where: { id },
    });

    if (!criterion) {
      throw new NotFoundException(`Critério de avaliação com id ${id} não encontrado.`);
    }

    return this.toResponseDto(criterion);
  }

  async update(
    id: number,
    updateDto: UpdateEvaluationCriterionDto,
  ): Promise<EvaluationCriterionResponseDto> {
    await this.findOne(id);

    const data = this.buildUpdateData(updateDto);

    try {
      const updated = await this.prisma.criterio_avaliacao.update({
        where: { id },
        data,
      });

      return this.toResponseDto(updated);
    } catch (error) {
      this.handleUniqueNomeConflict(error, updateDto.nome);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.criterio_avaliacao.update({
      where: { id },
      data: { ativo: false, desativado_em: new Date() },
    });
  }

  private buildUpdateData(
    updateDto: UpdateEvaluationCriterionDto,
  ): Prisma.criterio_avaliacaoUpdateInput {
    const data: Prisma.criterio_avaliacaoUpdateInput = { ...updateDto };

    if (updateDto.ativo === false) {
      data.desativado_em = new Date();
    } else if (updateDto.ativo === true) {
      data.desativado_em = null;
    }

    return data;
  }

  private handleUniqueNomeConflict(error: unknown, nome?: string): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const msg =
        (
          error.meta as { driverAdapterError?: { cause?: { originalMessage?: string } } }
        )?.driverAdapterError?.cause?.originalMessage?.toLowerCase() || '';

      if (nome && msg.includes('criterio_avaliacao_nome_key')) {
        throw new ConflictException(`Já existe um critério de avaliação com o nome "${nome}".`);
      }

      throw new ConflictException(
        'Já existe um critério de avaliação com dados únicos já cadastrados.',
      );
    }
  }

  private toResponseDto(criterion: criterio_avaliacao): EvaluationCriterionResponseDto {
    return {
      id: criterion.id,
      nome: criterion.nome,
      descricao: criterion.descricao,
      peso: criterion.peso,
      nota_maxima: criterion.nota_maxima,
      ativo: criterion.ativo,
      criado_em: criterion.criado_em,
      atualizado_em: criterion.atualizado_em,
      desativado_em: criterion.desativado_em,
    };
  }
}
