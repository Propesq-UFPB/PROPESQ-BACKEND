import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAcademicUnitDto } from './dto/create-academic-unit.dto';
import { UpdateAcademicUnitDto } from './dto/update-academic-unit.dto';
import { Prisma, unidade_academica } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AcademicUnitResponseDto } from './dto/academic-unit-response.dto';
import { PaginatedDto } from '../common/dto/paginated.dto';

@Injectable()
export class AcademicUnitService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUnit: CreateAcademicUnitDto): Promise<AcademicUnitResponseDto> {
    try {
      const createdUnit = await this.prisma.unidade_academica.create({ data: createUnit });
      return this.toResponseDto(createdUnit);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Extrai a mensagem de erro do Driver Adapter de forma segura usando optional chaining
        const msg =
          (error.meta as any)?.driverAdapterError?.cause?.originalMessage?.toLowerCase() || '';

        if (createUnit.nome && msg.includes('unidade_academica_nome_key')) {
          throw new ConflictException(
            `Já existe uma unidade acadêmica com o nome "${createUnit.nome}".`,
          );
        }
        if (createUnit.sigla && msg.includes('unidade_academica_sigla_key')) {
          throw new ConflictException(
            `Já existe uma unidade acadêmica com a sigla "${createUnit.sigla}".`,
          );
        }

        throw new ConflictException(
          'Já existe uma unidade acadêmica com dados únicos já cadastrados.',
        );
      }
      throw error;
    }
  }

  async findAll(limit: number, offset: number): Promise<PaginatedDto<AcademicUnitResponseDto>> {
    const [total, units] = await this.prisma.$transaction([
      this.prisma.unidade_academica.count(),
      this.prisma.unidade_academica.findMany({
        take: limit,
        skip: offset,
        orderBy: { id: 'asc' },
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: units.map(unit => this.toResponseDto(unit)),
    };
  }

  async findOne(id: number): Promise<AcademicUnitResponseDto> {
    const academicUnit = await this.prisma.unidade_academica.findUnique({
      where: { id },
    });

    if (!academicUnit) {
      throw new NotFoundException(`Unidade acadêmica com id ${id} não encontrada.`);
    }

    return this.toResponseDto(academicUnit);
  }

  async update(id: number, updateUnit: UpdateAcademicUnitDto): Promise<AcademicUnitResponseDto> {
    const academicUnit = await this.prisma.unidade_academica.findUnique({
      where: { id: id },
    });

    if (!academicUnit) {
      throw new NotFoundException(`Unidade acadêmica com id ${id} não encontrada.`);
    }

    try {
      const updatedUnit = await this.prisma.unidade_academica.update({
        where: { id: id },
        data: updateUnit,
      });

      return this.toResponseDto(updatedUnit);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const msg =
          (error.meta as any)?.driverAdapterError?.cause?.originalMessage?.toLowerCase() || '';

        if (updateUnit.nome && msg.includes('unidade_academica_nome_key')) {
          throw new ConflictException(
            `Já existe uma unidade acadêmica com o nome "${updateUnit.nome}".`,
          );
        }
        if (updateUnit.sigla && msg.includes('unidade_academica_sigla_key')) {
          throw new ConflictException(
            `Já existe uma unidade acadêmica com a sigla "${updateUnit.sigla}".`,
          );
        }

        throw new ConflictException(
          'Já existe uma unidade acadêmica com dados únicos já cadastrados.',
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.unidade_academica.delete({
      where: { id },
    });
  }

  private toResponseDto(unit: unidade_academica): AcademicUnitResponseDto {
    return {
      id: unit.id,
      sigla: unit.sigla,
      nome: unit.nome,
      ativo: unit.ativo,
    };
  }
}
