import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAcademicUnit } from './dto/create-academic-unit.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAcademicUnit } from './dto/update-academic-unit.dto';
import { ApiNoContentResponse } from '@nestjs/swagger';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { unidade_academica } from '@prisma/client';

@Injectable()
export class AcademicUnitService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUnit: CreateAcademicUnit) {
    return this.prisma.unidade_academica.create({ data: createUnit });
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedDto<unidade_academica>> {
    const [data, total] = await Promise.all([
      this.prisma.unidade_academica.findMany({ take: limit, skip: offset }),
      this.prisma.unidade_academica.count(),
    ]);

    return {
      total,
      limit,
      offset,
      results: data,
    };
  }

  async update(id: number, updateUnit: UpdateAcademicUnit) {
    const academic_unit = await this.prisma.unidade_academica.findUnique({
      where: { id: id },
    });

    if (!academic_unit) {
      throw new NotFoundException(
        `Centro acadêmico com id ${id} não encontrado`,
      );
    }

    console.log(JSON.stringify(updateUnit));

    return this.prisma.unidade_academica.update({
      where: { id: id },
      data: updateUnit,
    });
  }
}
