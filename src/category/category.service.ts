import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { categoria_edital, Prisma } from '@prisma/client';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryLookupDto } from './dto/category-lookup.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const created = await this.prisma.categoria_edital.create({ data: createDto });
    return this.toResponseDto(created);
  }

  async findAll(limit: number, offset: number): Promise<PaginatedResult<CategoryResponseDto>> {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.categoria_edital.count(),
      this.prisma.categoria_edital.findMany({
        take: limit,
        skip: offset,
        orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: rows.map(row => this.toResponseDto(row)),
    };
  }

  async getLookup(): Promise<CategoryLookupDto[]> {
    const rows = await this.prisma.categoria_edital.findMany({
      where: { ativo: true },
      select: { id: true, denominacao: true },
      orderBy: [{ ordem: 'asc' }, { denominacao: 'asc' }],
    });

    return rows.map(row => ({ id: row.id, name: row.denominacao }));
  }

  async findOne(id: number): Promise<CategoryResponseDto> {
    const category = await this.prisma.categoria_edital.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com id ${id} não encontrada.`);
    }

    return this.toResponseDto(category);
  }

  async update(id: number, updateDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    await this.findOne(id);

    const updated = await this.prisma.categoria_edital.update({
      where: { id },
      data: updateDto,
    });

    return this.toResponseDto(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    const check_edital = await this.prisma.edital.findFirst({ where: { categoria: { id: id } } });
    const check_reseach = await this.prisma.projeto_pesquisa.findFirst({
      where: { categoria: { id: id } },
    });

    if (check_edital || check_reseach) {
      throw new ConflictException(`Já existe um edital ou projeto de pesquisa com a categoria.`);
    }

    await this.prisma.categoria_edital.delete({
      where: { id },
    });
  }

  private toResponseDto(category: categoria_edital): CategoryResponseDto {
    return {
      id: category.id,
      denominacao: category.denominacao,
      ordem: category.ordem,
      ativo: category.ativo,
    };
  }
}
