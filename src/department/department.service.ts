import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, departamento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUnit(unitId: number): Promise<DepartmentResponseDto[]> {
    await this.assertUnitExists(unitId);

    const rows = await this.prisma.departamento.findMany({
      where: { unidade_id: unitId },
      orderBy: { id: 'asc' },
    });

    return rows.map(row => this.toResponseDto(row));
  }

  async findOne(unitId: number, id: number): Promise<DepartmentResponseDto> {
    await this.assertUnitExists(unitId);

    const row = await this.prisma.departamento.findFirst({
      where: { id, unidade_id: unitId },
    });

    if (!row) {
      throw new NotFoundException(
        `Departamento com id ${id} não encontrado na unidade ${unitId}.`,
      );
    }

    return this.toResponseDto(row);
  }

  async create(unitId: number, dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    await this.assertUnitExists(unitId);

    try {
      const created = await this.prisma.departamento.create({
        data: {
          sigla: dto.sigla,
          nome: dto.nome,
          unidade_id: unitId,
        },
      });

      return this.toResponseDto(created);
    } catch (error) {
      this.throwUniqueConflict(error, dto.sigla, dto.nome);
      throw error;
    }
  }

  async update(
    unitId: number,
    id: number,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    await this.findOne(unitId, id);

    try {
      const updated = await this.prisma.departamento.update({
        where: { id },
        data: dto,
      });

      return this.toResponseDto(updated);
    } catch (error) {
      this.throwUniqueConflict(error, dto.sigla, dto.nome);
      throw error;
    }
  }

  async remove(unitId: number, id: number): Promise<void> {
    await this.findOne(unitId, id);

    await this.prisma.departamento.delete({ where: { id } });
  }

  private async assertUnitExists(unitId: number): Promise<void> {
    const unit = await this.prisma.unidade_academica.findUnique({
      where: { id: unitId },
      select: { id: true },
    });

    if (!unit) {
      throw new NotFoundException(`Unidade acadêmica com id ${unitId} não encontrada.`);
    }
  }

  private throwUniqueConflict(error: unknown, sigla?: string, nome?: string): void {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      return;
    }

    const target = (error.meta?.target as string[] | string | undefined) ?? [];
    const targetText = Array.isArray(target) ? target.join(',') : String(target);

    if (targetText.includes('sigla') && sigla) {
      throw new ConflictException(
        `Já existe um departamento com a sigla "${sigla}" nesta unidade.`,
      );
    }

    if (targetText.includes('nome') && nome) {
      throw new ConflictException(
        `Já existe um departamento com o nome "${nome}" nesta unidade.`,
      );
    }

    throw new ConflictException(
      'Já existe um departamento com dados únicos já cadastrados nesta unidade.',
    );
  }

  private toResponseDto(row: departamento): DepartmentResponseDto {
    return {
      id: row.id,
      sigla: row.sigla,
      nome: row.nome,
      ativo: row.ativo,
      unidade_id: row.unidade_id,
    };
  }
}
