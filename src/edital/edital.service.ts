import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEditalDto } from './dto/create-edital.dto';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { UpdateEditalDto } from './dto/update-edital.dto';
import { TitulacaoMinMapper } from '../common/mapper/titulacao-min.mapper';
import type { UpdateEditalCotaDistribuicaoDto } from './dto/update-cota-distribuicao.dto';

@Injectable()
export class EditalService {
  constructor(private prisma: PrismaService) {}

  async create(createEditalDto: CreateEditalDto) {
    await this.assertEditalExistsByCodigo(createEditalDto.codigo);

    return this.prisma.edital.create({
      data: {
        data_cadastro: new Date(),
        codigo: createEditalDto.codigo,
        descricao: createEditalDto.descricao,
        titulacao_min: createEditalDto.titulacao_min,
        tipo: createEditalDto.tipo,
        validar_indice_min: createEditalDto.validar_indice_min,
        valor_indice_min: createEditalDto.valor_indice_min,
        limite_solicitacoes_orientador: createEditalDto.limite_solicitacoes_orientador,
        limite_planos_orientador: createEditalDto.limite_planos_orientador,
        edital_para_voluntarios: createEditalDto.edital_para_voluntarios,
        avaliacao_vigente: createEditalDto.avaliacao_vigente,
        apenas_orient_coordena_plano: createEditalDto.apenas_orient_coordena_plano,
        apenas_colab_vol_cadastra_plano: createEditalDto.apenas_colab_vol_cadastra_plano,
        prof_subst_cadastra_proj: createEditalDto.prof_subst_cadastra_proj,
        tec_admin_coord_proj: createEditalDto.tec_admin_coord_proj,
        categoria: createEditalDto.categoria,
        edital_cota_distribuicao: {
          createMany: {
            data: createEditalDto.edital_cota_distribuicao,
          },
        },
        periodo_submissoes: {
          create: {
            inicio: createEditalDto.periodo_submissao.inicio,
            fim: createEditalDto.periodo_submissao.fim,
          },
        },
        periodo_execucao_rel: {
          create: {
            inicio: createEditalDto.periodo_execucao.inicio,
            fim: createEditalDto.periodo_execucao.fim,
          },
        },
        ...(createEditalDto.periodo_correcao && {
          periodo_correcao: {
            create: {
              inicio: createEditalDto.periodo_correcao.inicio,
              fim: createEditalDto.periodo_correcao.fim,
            },
          },
        }),
      },
    });
  }

  async findMany(limit: number, offset: number): Promise<PaginatedResult<unknown>> {
    const [data, total] = await Promise.all([
      (
        await this.prisma.edital.findMany({
          select: {
            descricao: true,
            periodo_submissoes: {
              select: {
                inicio: true,
                fim: true,
              },
            },
            titulacao_min: true,
          },
          skip: offset,
          take: limit,
        })
      ).map(edital => {
        return this.formatEdital(edital);
      }),
      this.prisma.edital.count(),
    ]);

    return {
      limit: limit,
      offset: offset,
      total: total,
      results: data,
    };
  }

  private formatEdital(edital: any) {
    return {
      id: edital.id,
      descricao: edital.descricao,
      periodo_submissoes_inicio: edital.periodo_submissoes.inicio.toLocaleDateString('pt-br'),
      periodo_submissoes_fim: edital.periodo_submissoes.fim.toLocaleDateString('pt-br'),
      titulacao_min: TitulacaoMinMapper[edital.titulacao_min],
    };
  }

  async delete(id: number) {
    const edital = await this.prisma.edital.findUnique({ where: { id: id } });

    if (!edital) {
      throw new NotFoundException(`Edital ID ${id} não encontrado`);
    }

    return this.prisma.edital.delete({ where: { id: id } });
  }

  async findOne(id: number) {
    const edital = await this.prisma.edital.findUnique({
      where: { id: id },
      select: {
        id: true,
        codigo: true,
        descricao: true,
        titulacao_min: true,
        tipo: true,
        validar_indice_min: true,
        valor_indice_min: true,
        limite_solicitacoes_orientador: true,
        limite_planos_orientador: true,
        edital_para_voluntarios: true,
        avaliacao_vigente: true,
        apenas_orient_coordena_plano: true,
        apenas_colab_vol_cadastra_plano: true,
        prof_subst_cadastra_proj: true,
        tec_admin_coord_proj: true,
        categoria: true,
        periodo_submissoes: {
          select: {
            id: true,
            inicio: true,
            fim: true,
          },
        },
        periodo_correcao: {
          select: {
            id: true,
            inicio: true,
            fim: true,
          },
        },
        periodo_execucao_rel: {
          select: {
            id: true,
            inicio: true,
            fim: true,
          },
        },
        edital_cota_distribuicao: true,
      },
    });

    if (!edital) {
      throw new NotFoundException(`Edital com ID ${id} não encontrado`);
    }

    return edital;
  }

  async update(id: number, updateEditalDto: UpdateEditalDto) {
    await this.findOne(id);
    await this.assertEditalExistsByCodigo(updateEditalDto.codigo, id);

    await this.prisma.edital.update({
      where: { id },
      data: {
        codigo: updateEditalDto.codigo,
        descricao: updateEditalDto.descricao,
        titulacao_min: updateEditalDto.titulacao_min,
        tipo: updateEditalDto.tipo,
        validar_indice_min: updateEditalDto.validar_indice_min,
        valor_indice_min: updateEditalDto.valor_indice_min,
        limite_solicitacoes_orientador: updateEditalDto.limite_solicitacoes_orientador,
        limite_planos_orientador: updateEditalDto.limite_planos_orientador,
        edital_para_voluntarios: updateEditalDto.edital_para_voluntarios,
        avaliacao_vigente: updateEditalDto.avaliacao_vigente,
        apenas_orient_coordena_plano: updateEditalDto.apenas_orient_coordena_plano,
        apenas_colab_vol_cadastra_plano: updateEditalDto.apenas_colab_vol_cadastra_plano,
        prof_subst_cadastra_proj: updateEditalDto.prof_subst_cadastra_proj,
        tec_admin_coord_proj: updateEditalDto.tec_admin_coord_proj,
        categoria: updateEditalDto.categoria,
        ...(updateEditalDto.periodo_submissao && {
          periodo_submissoes: {
            update: {
              data: updateEditalDto.periodo_submissao,
            },
          },
        }),
        ...(updateEditalDto.periodo_execucao && {
          periodo_execucao_rel: {
            update: {
              data: updateEditalDto.periodo_execucao,
            },
          },
        }),
        ...(updateEditalDto.periodo_correcao && {
          periodo_correcao: {
            update: {
              data: updateEditalDto.periodo_correcao,
            },
          },
        }),
        ...(this.updateEditalCotaDistribuicao(id, updateEditalDto) ?? {}),
      },
    });
  }

  updateEditalCotaDistribuicao(id: number, updateEditalDto: UpdateEditalDto) {
    const update_data =
      updateEditalDto.update_edital_cota_distribuicao
        ?.filter(cota => cota.id !== undefined)
        .map(cota => {
          const { id: cota_id, ...data } = cota;
          return {
            where: { id: cota_id },
            data,
          };
        }) ?? [];

    const create_data = updateEditalDto.create_edital_cota_distribuicao ?? [];
    const delete_ids = updateEditalDto.delete_cota_distribuicao ?? [];

    if (!update_data.length && !create_data.length && !delete_ids.length) {
      return undefined;
    }

    return {
      edital_cota_distribuicao: {
        ...(update_data.length && { update: update_data }),
        ...(create_data.length && { createMany: { data: create_data } }),
        ...(delete_ids.length && { deleteMany: { id: { in: delete_ids }, id_edital: id } }),
      },
    };
  }

  // Verifica se código já existe, se sim, existe um conflito
  async assertEditalExistsByCodigo(codigo: string | undefined, id?: number): Promise<void> {
    if (!codigo) return;

    const edital = await this.prisma.edital.findUnique({ where: { codigo: codigo } });

    if (edital && edital.id != id) {
      throw new ConflictException(`Edital com código ${codigo} já existe`);
    }
  }
}
