import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEditalDto } from './dto/create-edital.dto';

@Injectable()
export class EditalService {
  constructor(private prisma: PrismaService) {}

  async create(createEditalDto: CreateEditalDto) {
    return this.prisma.edital.create({
      data: {
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
}
