import { Injectable } from '@nestjs/common';
import { CreateResearchDto } from '../research/dto/create-research.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Idioma, SituacaoProjeto } from '@prisma/client';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { findOneResearchDto } from './dto/find-one-research.dto';
import { CategoriaProjetoMapper } from 'src/common/mapper/categoria-projeto.mapper';
import { SituacaoProjetoMapper } from 'src/common/mapper/situacao-projeto.mapper';
import { TipoProjetoMapper } from 'src/common/mapper/tipo-projeto.mapper';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async create(createResearchDto: CreateResearchDto): Promise<any> {
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
        palavra_chave: {
          create: [
            ...createResearchDto.palavras_chave,
            ...createResearchDto.key_words,
          ],
        },
        corpoProjeto: {
          create: createResearchDto.corpo_projeto,
        },
      },
      include: { corpoProjeto: true, palavra_chave: true },
    });
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedDto<findOneResearchDto>> {
    const [data, total] = await Promise.all([
      (
        await this.prisma.projeto_pesquisa.findMany({
          include: { corpoProjeto: true, palavra_chave: true },
          take: limit,
          skip: offset,
          orderBy: { data_cadastro: 'desc' },
        })
      ).map((research) => {
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

  private formatResearch(research): findOneResearchDto {
    return {
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
        .filter((_) => _.lingua === Idioma.EN)
        .map((_) => {
          return _.palavra_chave;
        }),
      palavras_chave: research.palavra_chave
        .filter((_) => _.lingua === Idioma.PT)
        .map((_) => {
          return _.palavra_chave;
        }),
    };
  }
}
