import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoAvaliador } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { CreateAvaliadorDto } from './dto/create-avaliador.dto';
import { ListAvaliadoresQueryDto } from './dto/list-avaliadores-query.dto';
import { UpdateAvaliadorDto } from './dto/update-avaliador.dto';
import { UpdateMinhasAreasDto } from './dto/update-minhas-areas.dto';
import {
  AvaliadorResponseDto,
  MinhasAreasResponseDto,
  UsuarioElegivelDto,
} from './dto/avaliador-response.dto';
import { areasAtualizadasNoAno } from './areas-atualizacao';
import { EditalAvaliadorResponseDto } from './dto/edital-avaliador.dto';
import { FUNCAO_AVALIADOR_EXTERNO } from '../auth/funcoes';

// Funções de usuário que não podem ser cadastradas como avaliador interno
// (o usuário de sistema de um avaliador externo já nasce com o cadastro)
const FUNCOES_INELEGIVEIS = ['ALUNO', FUNCAO_AVALIADOR_EXTERNO];

export const avaliadorInclude = {
  usuario: { select: { id: true, nome: true, email: true } },
  externo: true,
  area_principal: true,
  areas_adicionais: {
    select: { area_conhecimento: true },
    orderBy: { area_conhecimento_id: 'asc' },
  },
} satisfies Prisma.avaliadorInclude;

// Área de conhecimento do registro docente do usuário (docente é a única entidade de pessoa com área)
const docenteAreaSelect = {
  docente: {
    where: { area_conhecimento_id: { not: null } },
    select: { area_conhecimento: true },
    orderBy: { id: 'asc' },
    take: 1,
  },
} satisfies Prisma.usuarioSelect;

export type AvaliadorComRelacoes = Prisma.avaliadorGetPayload<{ include: typeof avaliadorInclude }>;

@Injectable()
export class AvaliadoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAvaliadorDto): Promise<AvaliadorResponseDto> {
    const areaDocenteId = await this.assertUsuarioElegivel(dto.usuario_id);

    const existente = await this.prisma.avaliador.findUnique({
      where: { usuario_id: dto.usuario_id },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException(
        `O usuário ${dto.usuario_id} já está cadastrado como avaliador (id ${existente.id}).`,
      );
    }

    const areaPrincipalId = dto.area_principal_id ?? areaDocenteId;
    if (areaPrincipalId === null) {
      throw new BadRequestException(
        'Informe a área principal: o usuário não possui área de conhecimento cadastrada como docente.',
      );
    }

    const adicionais = this.normalizarAdicionais(areaPrincipalId, dto.areas_adicionais_ids);
    await this.assertAreasExistem([areaPrincipalId, ...adicionais]);

    try {
      const created = await this.prisma.avaliador.create({
        data: {
          usuario_id: dto.usuario_id,
          area_principal_id: areaPrincipalId,
          is_propesq: dto.is_propesq ?? false,
          is_voluntario: dto.is_voluntario ?? false,
          is_cnpq: dto.is_cnpq ?? false,
          ativo: dto.ativo ?? true,
          areas_atualizadas_em: new Date(),
          areas_adicionais: {
            create: adicionais.map(area_conhecimento_id => ({ area_conhecimento_id })),
          },
        },
        include: avaliadorInclude,
      });

      return this.toResponseDto(created);
    } catch (error) {
      // Dois cadastros simultâneos do mesmo usuário: a checagem acima não pega, o índice único sim
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          `O usuário ${dto.usuario_id} já está cadastrado como avaliador.`,
        );
      }
      throw error;
    }
  }

  async findAll(query: ListAvaliadoresQueryDto): Promise<PaginatedResult<AvaliadorResponseDto>> {
    const { limit = 10, offset = 0, area_adicional_id } = query;
    const termo = query.search?.trim();
    const where: Prisma.avaliadorWhereInput = {
      ativo: query.ativo,
      is_propesq: query.is_propesq,
      is_voluntario: query.is_voluntario,
      is_cnpq: query.is_cnpq,
      tipo: query.tipo,
      area_principal_id: query.area_principal_id,
      ...(area_adicional_id !== undefined && {
        areas_adicionais: { some: { area_conhecimento_id: area_adicional_id } },
      }),
      ...(termo && {
        usuario: {
          OR: [
            { nome: { contains: termo, mode: 'insensitive' } },
            { email: { contains: termo, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.avaliador.count({ where }),
      this.prisma.avaliador.findMany({
        where,
        include: avaliadorInclude,
        take: limit,
        skip: offset,
        orderBy: [{ ativo: 'desc' }, { usuario: { nome: 'asc' } }],
      }),
    ]);

    return { total, limit, offset, results: rows.map(row => this.toResponseDto(row)) };
  }

  async findOne(id: number): Promise<AvaliadorResponseDto> {
    return this.toResponseDto(await this.getOrFail(id));
  }

  async update(id: number, dto: UpdateAvaliadorDto): Promise<AvaliadorResponseDto> {
    const atual = await this.getOrFail(id);

    const areaPrincipalId = dto.area_principal_id ?? atual.area_principal_id;
    const adicionais =
      dto.areas_adicionais_ids !== undefined
        ? this.normalizarAdicionais(areaPrincipalId, dto.areas_adicionais_ids)
        : undefined;

    await this.assertAreasExistem([
      ...(dto.area_principal_id !== undefined ? [dto.area_principal_id] : []),
      ...(adicionais ?? []),
    ]);

    const updated = await this.prisma.$transaction(async prisma => {
      if (adicionais !== undefined) {
        await prisma.avaliador_area_adicional.deleteMany({ where: { avaliador_id: id } });
      } else if (dto.area_principal_id !== undefined) {
        // A nova área principal não pode continuar listada como adicional
        await prisma.avaliador_area_adicional.deleteMany({
          where: { avaliador_id: id, area_conhecimento_id: dto.area_principal_id },
        });
      }

      return prisma.avaliador.update({
        where: { id },
        data: {
          area_principal_id: dto.area_principal_id,
          is_propesq: dto.is_propesq,
          is_voluntario: dto.is_voluntario,
          is_cnpq: dto.is_cnpq,
          ativo: dto.ativo,
          ...((dto.area_principal_id !== undefined || adicionais !== undefined) && {
            areas_atualizadas_em: new Date(),
          }),
          ...(adicionais !== undefined && {
            areas_adicionais: {
              create: adicionais.map(area_conhecimento_id => ({ area_conhecimento_id })),
            },
          }),
        },
        include: avaliadorInclude,
      });
    });

    return this.toResponseDto(updated);
  }

  /** Áreas de avaliação do próprio usuário, com a área do docente como sugestão. */
  async findMinhasAreas(usuarioId: number): Promise<MinhasAreasResponseDto> {
    const [avaliador, usuario] = await Promise.all([
      this.prisma.avaliador.findUnique({
        where: { usuario_id: usuarioId },
        include: avaliadorInclude,
      }),
      this.prisma.usuario.findUnique({ where: { id: usuarioId }, select: docenteAreaSelect }),
    ]);

    return {
      avaliador_cadastro_id: avaliador?.id ?? null,
      area_principal: avaliador?.area_principal ?? null,
      areas_adicionais: avaliador?.areas_adicionais.map(a => a.area_conhecimento) ?? [],
      areas_atualizadas_em: avaliador?.areas_atualizadas_em ?? null,
      atualizado_no_ano: areasAtualizadasNoAno(avaliador?.areas_atualizadas_em),
      area_sugerida: usuario?.docente[0]?.area_conhecimento ?? null,
    };
  }

  /**
   * O próprio docente atualiza suas áreas. Se ainda não for avaliador, o cadastro
   * é criado já ativo para entrar na distribuição.
   */
  async updateMinhasAreas(
    usuarioId: number,
    dto: UpdateMinhasAreasDto,
  ): Promise<MinhasAreasResponseDto> {
    await this.assertUsuarioElegivel(usuarioId);

    const adicionais = this.normalizarAdicionais(dto.area_principal_id, dto.areas_adicionais_ids);
    await this.assertAreasExistem([dto.area_principal_id, ...adicionais]);

    const data = {
      area_principal_id: dto.area_principal_id,
      areas_atualizadas_em: new Date(),
      areas_adicionais: {
        create: adicionais.map(area_conhecimento_id => ({ area_conhecimento_id })),
      },
    };

    await this.prisma.$transaction(async prisma => {
      await prisma.avaliador_area_adicional.deleteMany({
        where: { avaliador: { usuario_id: usuarioId } },
      });
      await prisma.avaliador.upsert({
        where: { usuario_id: usuarioId },
        create: { usuario_id: usuarioId, ...data },
        update: data,
      });
    });

    return this.findMinhasAreas(usuarioId);
  }

  /**
   * Remove o avaliador. Se ele já possui atribuições de avaliação, apenas desativa
   * para preservar o histórico.
   */
  async remove(id: number): Promise<void> {
    const avaliador = await this.getOrFail(id);

    // Atribuições são do usuário avaliador (avaliador.usuario_id é único)
    const atribuicoes = await this.prisma.projeto_avaliacao.count({
      where: { avaliador_id: avaliador.usuario_id },
    });

    if (atribuicoes > 0) {
      await this.prisma.avaliador.update({ where: { id }, data: { ativo: false } });
      return;
    }

    if (avaliador.tipo === TipoAvaliador.EXTERNO) {
      // O usuário de sistema só existe para representar o externo: sai junto com o cadastro
      await this.prisma.$transaction([
        this.prisma.avaliador.delete({ where: { id } }),
        this.prisma.usuario.delete({ where: { id: avaliador.usuario_id } }),
      ]);
      return;
    }

    await this.prisma.avaliador.delete({ where: { id } });
  }

  /** Usuários que podem ser cadastrados como avaliador e ainda não são. */
  async findUsuariosElegiveis(search?: string, limit = 20): Promise<UsuarioElegivelDto[]> {
    const termo = search?.trim();

    const rows = await this.prisma.usuario.findMany({
      where: {
        avaliador: { is: null },
        funcao: { nome: { notIn: FUNCOES_INELEGIVEIS, mode: 'insensitive' } },
        ...(termo && {
          OR: [
            { nome: { contains: termo, mode: 'insensitive' } },
            { email: { contains: termo, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        funcao: { select: { nome: true } },
        ...docenteAreaSelect,
      },
      orderBy: { nome: 'asc' },
      take: limit,
    });

    return rows.map(({ funcao, docente, ...usuario }) => ({
      ...usuario,
      funcao: funcao.nome,
      area_conhecimento: docente[0]?.area_conhecimento ?? null,
    }));
  }

  // --- Vínculo com o edital ---

  async findByEdital(editalId: number): Promise<EditalAvaliadorResponseDto[]> {
    await this.assertEditalExiste(editalId);

    const [vinculos, cargas] = await Promise.all([
      this.prisma.edital_avaliador.findMany({
        where: { edital_id: editalId },
        include: { avaliador: { include: avaliadorInclude } },
        orderBy: { avaliador: { usuario: { nome: 'asc' } } },
      }),
      this.cargasNoEdital(editalId),
    ]);

    return vinculos.map(v => ({
      ...this.toResponseDto(v.avaliador),
      carga: cargas.get(v.avaliador.usuario_id) ?? 0,
      vinculado_em: v.criado_em,
    }));
  }

  async addToEdital(editalId: number, avaliadorId: number): Promise<EditalAvaliadorResponseDto> {
    await this.assertEditalExiste(editalId);
    await this.assertAvaliadoresVinculaveis([avaliadorId]);

    const vinculo = await this.prisma.edital_avaliador.findUnique({
      where: { edital_id_avaliador_id: { edital_id: editalId, avaliador_id: avaliadorId } },
      select: { id: true },
    });
    if (vinculo) {
      throw new ConflictException(`O avaliador ${avaliadorId} já está vinculado ao edital.`);
    }

    await this.prisma.edital_avaliador.create({
      data: { edital_id: editalId, avaliador_id: avaliadorId },
    });

    const vinculados = await this.findByEdital(editalId);
    return vinculados.find(v => v.id === avaliadorId)!;
  }

  async removeFromEdital(editalId: number, avaliadorId: number): Promise<void> {
    await this.assertEditalExiste(editalId);

    const vinculo = await this.prisma.edital_avaliador.findUnique({
      where: { edital_id_avaliador_id: { edital_id: editalId, avaliador_id: avaliadorId } },
      select: { id: true },
    });
    if (!vinculo) {
      throw new NotFoundException(`O avaliador ${avaliadorId} não está vinculado ao edital.`);
    }

    await this.assertSemAtribuicoesNoEdital(editalId, [avaliadorId]);
    await this.prisma.edital_avaliador.delete({ where: { id: vinculo.id } });
  }

  /** Substitui o conjunto de avaliadores vinculados ao edital. */
  async setEditalAvaliadores(
    editalId: number,
    avaliadorIds: number[],
  ): Promise<EditalAvaliadorResponseDto[]> {
    await this.assertEditalExiste(editalId);

    const atuais = await this.prisma.edital_avaliador.findMany({
      where: { edital_id: editalId },
      select: { avaliador_id: true },
    });
    const atuaisIds = new Set(atuais.map(a => a.avaliador_id));
    const desejados = new Set(avaliadorIds);

    const adicionar = avaliadorIds.filter(id => !atuaisIds.has(id));
    const remover = [...atuaisIds].filter(id => !desejados.has(id));

    await this.assertAvaliadoresVinculaveis(adicionar);
    await this.assertSemAtribuicoesNoEdital(editalId, remover);

    await this.prisma.$transaction([
      this.prisma.edital_avaliador.deleteMany({
        where: { edital_id: editalId, avaliador_id: { in: remover } },
      }),
      this.prisma.edital_avaliador.createMany({
        data: adicionar.map(avaliador_id => ({ edital_id: editalId, avaliador_id })),
      }),
    ]);

    return this.findByEdital(editalId);
  }

  // --- Auxiliares ---

  private async getOrFail(id: number): Promise<AvaliadorComRelacoes> {
    const avaliador = await this.prisma.avaliador.findUnique({
      where: { id },
      include: avaliadorInclude,
    });

    if (!avaliador) {
      throw new NotFoundException(`Avaliador com id ${id} não encontrado.`);
    }

    return avaliador;
  }

  /** Remove repetições e a própria área principal da lista de áreas adicionais. */
  normalizarAdicionais(areaPrincipalId: number, adicionais: number[] = []): number[] {
    return [...new Set(adicionais)].filter(id => id !== areaPrincipalId);
  }

  /** Valida o usuário e retorna a área de conhecimento do seu registro docente, se houver. */
  private async assertUsuarioElegivel(usuarioId: number): Promise<number | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { funcao: { select: { nome: true } }, ...docenteAreaSelect },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com id ${usuarioId} não encontrado.`);
    }
    if (FUNCOES_INELEGIVEIS.includes(usuario.funcao.nome.toUpperCase())) {
      throw new BadRequestException(
        `Usuários com a função ${usuario.funcao.nome} não podem ser avaliadores.`,
      );
    }

    return usuario.docente[0]?.area_conhecimento?.id ?? null;
  }

  async assertAreasExistem(ids: number[]): Promise<void> {
    const unicos = [...new Set(ids)];
    if (!unicos.length) return;

    const encontradas = await this.prisma.area_conhecimento.findMany({
      where: { id: { in: unicos } },
      select: { id: true },
    });

    const faltando = unicos.filter(id => !encontradas.some(a => a.id === id));
    if (faltando.length) {
      throw new BadRequestException(
        `Área(s) de conhecimento não encontrada(s): ${faltando.join(', ')}.`,
      );
    }
  }

  private async assertEditalExiste(editalId: number): Promise<void> {
    const edital = await this.prisma.edital.findUnique({
      where: { id: editalId },
      select: { id: true },
    });
    if (!edital) {
      throw new NotFoundException(`Edital com id ${editalId} não encontrado.`);
    }
  }

  private async assertAvaliadoresVinculaveis(ids: number[]): Promise<void> {
    if (!ids.length) return;

    const avaliadores = await this.prisma.avaliador.findMany({
      where: { id: { in: ids } },
      select: { id: true, ativo: true },
    });

    const naoEncontrados = ids.filter(id => !avaliadores.some(c => c.id === id));
    if (naoEncontrados.length) {
      throw new NotFoundException(`Avaliador(es) não encontrado(s): ${naoEncontrados.join(', ')}.`);
    }

    const inativos = avaliadores.filter(c => !c.ativo).map(c => c.id);
    if (inativos.length) {
      throw new BadRequestException(
        `Avaliador(es) inativo(s) não podem ser vinculados: ${inativos.join(', ')}.`,
      );
    }
  }

  /** Impede desvincular avaliadores que já têm atribuições no edital. */
  private async assertSemAtribuicoesNoEdital(editalId: number, ids: number[]): Promise<void> {
    if (!ids.length) return;

    // projeto_avaliacao.avaliador_id é o usuário; o cadastro vem por usuario.avaliador
    const comAtribuicoes = await this.prisma.projeto_avaliacao.findMany({
      where: {
        avaliador: { avaliador: { is: { id: { in: ids } } } },
        projeto_pesquisa: { edital_id: editalId },
      },
      select: { avaliador: { select: { avaliador: { select: { id: true } } } } },
      distinct: ['avaliador_id'],
    });

    if (comAtribuicoes.length) {
      throw new ConflictException(
        `Avaliador(es) com atribuições neste edital não podem ser desvinculados: ${comAtribuicoes
          .map(a => a.avaliador.avaliador?.id)
          .join(', ')}. Remova as atribuições pela distribuição antes.`,
      );
    }
  }

  /** Número de projetos atribuídos por usuário avaliador no edital. */
  private async cargasNoEdital(editalId: number): Promise<Map<number, number>> {
    const grupos = await this.prisma.projeto_avaliacao.groupBy({
      by: ['avaliador_id'],
      where: { projeto_pesquisa: { edital_id: editalId } },
      _count: { _all: true },
    });

    return new Map(grupos.map(g => [g.avaliador_id, g._count._all]));
  }

  toResponseDto(avaliador: AvaliadorComRelacoes): AvaliadorResponseDto {
    const externo = avaliador.externo;
    return {
      id: avaliador.id,
      usuario: avaliador.usuario,
      tipo: avaliador.tipo,
      externo: externo && {
        instituicao: externo.instituicao,
        titulacao: externo.titulacao,
        cpf: externo.cpf,
        pais: externo.pais,
        telefone: externo.telefone,
        lattes_url: externo.lattes_url,
        orcid: externo.orcid,
        observacao: externo.observacao,
      },
      area_principal: avaliador.area_principal,
      areas_adicionais: avaliador.areas_adicionais.map(a => a.area_conhecimento),
      is_propesq: avaliador.is_propesq,
      is_voluntario: avaliador.is_voluntario,
      is_cnpq: avaliador.is_cnpq,
      ativo: avaliador.ativo,
      areas_atualizadas_em: avaliador.areas_atualizadas_em,
      criado_em: avaliador.criado_em,
      atualizado_em: avaliador.atualizado_em,
    };
  }
}
