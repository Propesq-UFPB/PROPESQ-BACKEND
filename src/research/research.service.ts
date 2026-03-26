import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResearchDto } from '../research/dto/create-research.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Idioma, SituacaoProjeto, type projeto_pesquisa } from '@prisma/client';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { findOneResearchDto } from './dto/find-one-research.dto';
import { CategoriaProjetoMapper } from '../common/mapper/categoria-projeto.mapper';
import { SituacaoProjetoMapper } from '../common/mapper/situacao-projeto.mapper';
import { TipoProjetoMapper } from '../common/mapper/tipo-projeto.mapper';
import { updateResearchDto } from './dto/update-research.dto';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async create(createResearchDto: CreateResearchDto): Promise<any> {
    const academic_unit = await this.prisma.unidade_academica.findUnique({
      where: { id: createResearchDto.unidade_id },
    });

    if (!academic_unit) {
      throw new NotFoundException(
        `Unidade acadêmica com id ${createResearchDto.unidade_id} não encontrada`,
      );
    }

    return this.prisma.projeto_pesquisa.create({
      data: {
        tipo: createResearchDto.tipo,
        codigo: 'DEFAULT_CODE',
        data_cadastro: new Date(),
        titulo: createResearchDto.titulo,
        title: createResearchDto.title,
        categoria: createResearchDto.categoria,
        email: createResearchDto.email,
        situacao: SituacaoProjeto.SUBMETIDO,
        vigencia: createResearchDto.vigencia,
        ...(Array.isArray(createResearchDto.palavras_chave_ids) && {
          palavra_chave: {
            connect: createResearchDto.palavras_chave_ids.map((id: number) => ({ id })),
          },
        }),
        objetivos: {
          create: createResearchDto.objetivos.map((objetivo_id: number) => {
            return {
              objetivo: {
                connect: { id: objetivo_id },
              },
            };
          }),
        },
        atividades: {
          create: createResearchDto.atividades.map(atividade => {
            return {
              descricao: atividade.descricao,
              meses: {
                create: atividade.meses.map(mes => {
                  return {
                    data: mes,
                  };
                }),
              },
            };
          }),
        },
        corpo_projeto: {
          create: createResearchDto.corpo_projeto,
        },
        unidade_academica: {
          connect: { id: createResearchDto.unidade_id },
        },
      },
      include: {
        corpo_projeto: true,
        palavra_chave: true,
        atividades: { include: { meses: true } },
      },
    });
  }

  async findAll(limit: number, offset: number): Promise<PaginatedDto<findOneResearchDto>> {
    const [data, total] = await Promise.all([
      (
        await this.prisma.projeto_pesquisa.findMany({
          include: {
            corpo_projeto: true,
            palavra_chave: true,
            objetivos: true,
          },
          take: limit,
          skip: offset,
          orderBy: { data_cadastro: 'desc' },
        })
      ).map(research => {
        return this.formatResearch(research);
      }),
      this.prisma.projeto_pesquisa.count(),
    ]);

    return {
      total,
      limit,
      offset,
      results: data,
    };
  }

  async findOne(id: number): Promise<findOneResearchDto> {
    const data = await this.prisma.projeto_pesquisa.findUnique({
      where: { id: id },
      include: {
        objetivos: {
          include: {
            objetivo: true,
          },
        },
        unidade_academica: true,
        palavra_chave: true,
        corpo_projeto: true,
        anexo_projeto_pesquisa: true,
        atividades: {
          include: {
            meses: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Projeto de pesquisa Id ${id} não encontrado`);
    }

    return this.formatResearch(data, true);
  }

  async update(id: number, updateResearchDto: updateResearchDto) {
    await this.findOne(id);

    return this.prisma.projeto_pesquisa.update({
      where: { id: id },
      data: {
        tipo: updateResearchDto.tipo,
        codigo: 'DEFAULT_CODE',
        data_cadastro: new Date(),
        titulo: updateResearchDto.titulo,
        title: updateResearchDto.title,
        categoria: updateResearchDto.categoria,
        email: updateResearchDto.email,
        situacao: SituacaoProjeto.SUBMETIDO,
        vigencia: updateResearchDto.vigencia,
        ...(Array.isArray(updateResearchDto.palavras_chave_ids) && {
          palavra_chave: {
            set: updateResearchDto.palavras_chave_ids.map((id: number) => ({ id })),
          },
        }),
        ...(Array.isArray(updateResearchDto.objetivos) && {
          objetivos: {
            deleteMany: {},
            create: updateResearchDto?.objetivos.map((objetivo_id: number) => ({
              objetivo: {
                connect: { id: objetivo_id },
              },
            })),
          },
        }),
        ...(Array.isArray(updateResearchDto.atividades) && {
          atividades: {
            deleteMany: {},
            create: updateResearchDto.atividades.map(atividade => {
              return {
                descricao: atividade.descricao,
                meses: {
                  create: atividade.meses.map(mes => {
                    return {
                      data: mes,
                    };
                  }),
                },
              };
            }),
          },
        }),
        corpo_projeto: {
          create: updateResearchDto.corpo_projeto,
        },

        unidade_id: updateResearchDto.unidade_id,
      },
      include: { corpo_projeto: true, palavra_chave: true },
    });
  }

  private formatResearch(research, full: boolean = false): findOneResearchDto {
    const formatted_research: findOneResearchDto = {
      id: research.id,
      tipo: TipoProjetoMapper[research.tipo],
      titulo: research.titulo,
      title: research.title,
      categoria: CategoriaProjetoMapper[research.categoria],
      codigo: research.codigo,
      email: research.email,
      situacao: SituacaoProjetoMapper[research.situacao],
      data_cadastro: research.data_cadastro.toLocaleDateString('pt-br'),
      key_words: research.palavra_chave
        .filter(_ => _.lingua === Idioma.EN)
        .map(_ => {
          return _.palavra_chave;
        }),
      palavras_chave: research.palavra_chave
        .filter(_ => _.lingua === Idioma.PT)
        .map(_ => {
          return _.palavra_chave;
        }),
      objetivos: research?.objetivos?.map(objetivo => {
        return objetivo.objetivo;
      }),
      atividades: research?.atividades?.map(atividade => {
        return {
          descricao: atividade.descricao,
          meses: atividade.meses.map(mes => {
            return mes.data;
          }),
        };
      }),
    };

    if (full) {
      formatted_research.corpo = {
        resumo: research.corpo_projeto.resumo,
        abstract: research.corpo_projeto.abstract,
        introducao: research.corpo_projeto.introducao,
        objetivos: research.corpo_projeto.objetivos,
        metodologia: research.corpo_projeto.metodologia,
        referencias: research.corpo_projeto.referencias,
        resultados_esperados: research.corpo_projeto.resultados_esperados,
      };
    }

    return formatted_research;
  }

  async delete(id: number) {
    const research_exists = await this.prisma.projeto_pesquisa.findUnique({
      where: { id },
    });

    if (!research_exists) {
      throw new NotFoundException(`Projeto de pesquisa Id ${id} não encontrado`);
    }

    return this.prisma.projeto_pesquisa.delete({
      where: { id },
      include: {
        anexo_projeto_pesquisa: true,
        objetivos: true,
        palavra_chave: true,
        corpo_projeto: true,
      },
    });
  }
}
