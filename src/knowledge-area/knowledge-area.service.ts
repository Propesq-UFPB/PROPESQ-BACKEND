import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KnowledgeAreaLookupDto, KnowledgeAreaLookupLevel } from './dto/knowledge-area-lookup.dto';
import { KnowledgeAreaLookupQueryDto } from './dto/knowledge-area-lookup-query.dto';

@Injectable()
export class KnowledgeAreaService {
  constructor(private readonly prisma: PrismaService) {}

  async getLookup(query: KnowledgeAreaLookupQueryDto): Promise<KnowledgeAreaLookupDto[]> {
    const parentFilters: Prisma.area_conhecimentoWhereInput = {
      ...(query.grande_area && { grande_area: query.grande_area }),
      ...(query.area && { area: query.area }),
      ...(query.sub_area && { sub_area: query.sub_area }),
    };

    if (query.sub_area) {
      const rows = await this.prisma.area_conhecimento.findMany({
        where: {
          ...parentFilters,
          especialidade: { not: '' },
        },
        select: { id: true, especialidade: true },
        orderBy: { especialidade: 'asc' },
      });

      return rows.map(row => ({
        id: row.id,
        name: row.especialidade,
        level: KnowledgeAreaLookupLevel.ESPECIALIDADE,
      }));
    }

    if (query.area) {
      const rows = await this.prisma.area_conhecimento.findMany({
        where: {
          ...parentFilters,
          sub_area: { not: '' },
          especialidade: '',
        },
        select: { id: true, sub_area: true },
        orderBy: { sub_area: 'asc' },
      });

      return rows.map(row => ({
        id: row.id,
        name: row.sub_area,
        level: KnowledgeAreaLookupLevel.SUB_AREA,
      }));
    }

    if (query.grande_area) {
      const rows = await this.prisma.area_conhecimento.findMany({
        where: {
          ...parentFilters,
          area: { not: '' },
          sub_area: '',
          especialidade: '',
        },
        select: { id: true, area: true },
        orderBy: { area: 'asc' },
      });

      return rows.map(row => ({
        id: row.id,
        name: row.area,
        level: KnowledgeAreaLookupLevel.AREA,
      }));
    }

    const rows = await this.prisma.area_conhecimento.findMany({
      where: {
        area: '',
        sub_area: '',
        especialidade: '',
      },
      select: { id: true, grande_area: true },
      orderBy: { grande_area: 'asc' },
    });

    return rows.map(row => ({
      id: row.id,
      name: row.grande_area,
      level: KnowledgeAreaLookupLevel.GRANDE_AREA,
    }));
  }
}
