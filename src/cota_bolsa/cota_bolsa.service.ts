import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCotaBolsaDto } from './dto/create-cota-bolsa.dto';
import { UpdateCotaBolsaDto } from './dto/update-cota-bolsa.dto';
import { PaginatedDto } from '../common/dto/paginated.dto';

@Injectable()
export class CotaBolsaService {
  constructor(private prisma: PrismaService) {}

  async create(createCotaBolsaDto: CreateCotaBolsaDto) {
    await this.assertCotaBolsaExistsByCodigo(createCotaBolsaDto.codigo);

    return this.prisma.cota_bolsa.create({
      data: {
        codigo: createCotaBolsaDto.codigo,
        relatorio_anual: createCotaBolsaDto.relatorio_anual,
        orgao_financiador: createCotaBolsaDto.orgao_financiador,
        descricao: createCotaBolsaDto.descricao,
        periodo_validade: {
          create: createCotaBolsaDto.periodo_validade,
        },
        periodo_relatorio_parcial: {
          create: createCotaBolsaDto.envio_relatorios_parciais,
        },
        periodo_relatorio_final: {
          create: createCotaBolsaDto.envio_relatorios_finais,
        },
        periodo_cadastro_voluntario: {
          create: createCotaBolsaDto.cadastro_plano_voluntario,
        },
      },
    });
  }

  async findMany(limit: number, offset: number): Promise<PaginatedDto<any>> {
    const [data, total] = await Promise.all([
      this.prisma.cota_bolsa.findMany({
        select: {
          id: true,
          codigo: true,
          descricao: true,
          orgao_financiador: true,
          relatorio_anual: true,
          periodo_validade: {
            select: {
              inicio: true,
              fim: true,
            },
          },
        },
        skip: offset,
        take: limit,
      }),
      this.prisma.cota_bolsa.count(),
    ]);

    return {
      limit,
      offset,
      total,
      results: data,
    };
  }

  async findOne(id: number) {
    const cotaBolsa = await this.prisma.cota_bolsa.findUnique({
      where: { id },
      select: {
        id: true,
        codigo: true,
        relatorio_anual: true,
        orgao_financiador: true,
        descricao: true,
        periodo_validade: {
          select: { id: true, inicio: true, fim: true },
        },
        periodo_relatorio_parcial: {
          select: { id: true, inicio: true, fim: true },
        },
        periodo_relatorio_final: {
          select: { id: true, inicio: true, fim: true },
        },
        periodo_cadastro_voluntario: {
          select: { id: true, inicio: true, fim: true },
        },
      },
    });

    if (!cotaBolsa) {
      throw new NotFoundException(`Cota bolsa com ID ${id} não encontrada`);
    }

    return cotaBolsa;
  }

  async update(id: number, updateCotaBolsaDto: UpdateCotaBolsaDto) {
    await this.findOne(id);
    await this.assertCotaBolsaExistsByCodigo(updateCotaBolsaDto.codigo, id);

    return this.prisma.cota_bolsa.update({
      where: { id },
      data: {
        codigo: updateCotaBolsaDto.codigo,
        relatorio_anual: updateCotaBolsaDto.relatorio_anual,
        orgao_financiador: updateCotaBolsaDto.orgao_financiador,
        descricao: updateCotaBolsaDto.descricao,
        ...(updateCotaBolsaDto.periodo_validade && {
          periodo_validade: {
            update: { data: updateCotaBolsaDto.periodo_validade },
          },
        }),
        ...(updateCotaBolsaDto.envio_relatorios_parciais && {
          periodo_relatorio_parcial: {
            update: { data: updateCotaBolsaDto.envio_relatorios_parciais },
          },
        }),
        ...(updateCotaBolsaDto.envio_relatorios_finais && {
          periodo_relatorio_final: {
            update: { data: updateCotaBolsaDto.envio_relatorios_finais },
          },
        }),
        ...(updateCotaBolsaDto.cadastro_plano_voluntario && {
          periodo_cadastro_voluntario: {
            update: { data: updateCotaBolsaDto.cadastro_plano_voluntario },
          },
        }),
      },
    });
  }

  async delete(id: number) {
    await this.findOne(id);

    return this.prisma.cota_bolsa.delete({ where: { id } });
  }

  async assertCotaBolsaExistsByCodigo(codigo: string | undefined, id?: number): Promise<void> {
    if (!codigo) return;

    const cotaBolsa = await this.prisma.cota_bolsa.findUnique({ where: { codigo } });

    if (cotaBolsa && cotaBolsa.id !== id) {
      throw new ConflictException(`Cota bolsa com código ${codigo} já existe`);
    }
  }
}
