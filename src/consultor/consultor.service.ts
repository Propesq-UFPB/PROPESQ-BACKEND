import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { CreateConsultorDto } from './dto/create-consultor.dto';
import { UpdateConsultorDto } from './dto/update-consultor.dto';
import { ConsultorResponseDto, UsuarioElegivelDto } from './dto/consultor-response.dto';
import { EditalConsultorResponseDto } from './dto/edital-consultor.dto';

// Funções de usuário que não podem ser consultores
const FUNCOES_INELEGIVEIS = ['ALUNO'];

const consultorInclude = {
  usuario: { select: { id: true, nome: true, email: true } },
  area_principal: true,
  areas_adicionais: {
    select: { area_conhecimento: true },
    orderBy: { area_conhecimento_id: 'asc' },
  },
} satisfies Prisma.consultorInclude;

// Área de conhecimento do registro docente do usuário (docente é a única entidade de pessoa com área)
const docenteAreaSelect = {
  docente: {
    where: { area_conhecimento_id: { not: null } },
    select: { area_conhecimento: true },
    orderBy: { id: 'asc' },
    take: 1,
  },
} satisfies Prisma.usuarioSelect;

type ConsultorComRelacoes = Prisma.consultorGetPayload<{ include: typeof consultorInclude }>;

@Injectable()
export class ConsultorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConsultorDto): Promise<ConsultorResponseDto> {
    const areaDocenteId = await this.assertUsuarioElegivel(dto.usuario_id);

    const existente = await this.prisma.consultor.findUnique({
      where: { usuario_id: dto.usuario_id },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException(
        `O usuário ${dto.usuario_id} já está cadastrado como consultor (id ${existente.id}).`,
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

    const created = await this.prisma.consultor.create({
      data: {
        usuario_id: dto.usuario_id,
        area_principal_id: areaPrincipalId,
        is_propesq: dto.is_propesq ?? false,
        is_voluntario: dto.is_voluntario ?? false,
        is_cnpq: dto.is_cnpq ?? false,
        ativo: dto.ativo ?? true,
        areas_adicionais: {
          create: adicionais.map(area_conhecimento_id => ({ area_conhecimento_id })),
        },
      },
      include: consultorInclude,
    });

    return this.toResponseDto(created);
  }

  async findAll(
    limit: number,
    offset: number,
    ativo?: boolean,
    search?: string,
  ): Promise<PaginatedResult<ConsultorResponseDto>> {
    const termo = search?.trim();
    const where: Prisma.consultorWhereInput = {
      ...(ativo !== undefined && { ativo }),
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
      this.prisma.consultor.count({ where }),
      this.prisma.consultor.findMany({
        where,
        include: consultorInclude,
        take: limit,
        skip: offset,
        orderBy: [{ ativo: 'desc' }, { usuario: { nome: 'asc' } }],
      }),
    ]);

    return { total, limit, offset, results: rows.map(row => this.toResponseDto(row)) };
  }

  async findOne(id: number): Promise<ConsultorResponseDto> {
    return this.toResponseDto(await this.getOrFail(id));
  }

  async update(id: number, dto: UpdateConsultorDto): Promise<ConsultorResponseDto> {
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
        await prisma.consultor_area_adicional.deleteMany({ where: { consultor_id: id } });
      } else if (dto.area_principal_id !== undefined) {
        // A nova área principal não pode continuar listada como adicional
        await prisma.consultor_area_adicional.deleteMany({
          where: { consultor_id: id, area_conhecimento_id: dto.area_principal_id },
        });
      }

      return prisma.consultor.update({
        where: { id },
        data: {
          area_principal_id: dto.area_principal_id,
          is_propesq: dto.is_propesq,
          is_voluntario: dto.is_voluntario,
          is_cnpq: dto.is_cnpq,
          ativo: dto.ativo,
          ...(adicionais !== undefined && {
            areas_adicionais: {
              create: adicionais.map(area_conhecimento_id => ({ area_conhecimento_id })),
            },
          }),
        },
        include: consultorInclude,
      });
    });

    return this.toResponseDto(updated);
  }

  /**
   * Remove o consultor. Se ele já possui atribuições de avaliação, apenas desativa
   * para preservar o histórico.
   */
  async remove(id: number): Promise<void> {
    await this.getOrFail(id);

    const atribuicoes = await this.prisma.projeto_avaliacao.count({ where: { consultor_id: id } });

    if (atribuicoes > 0) {
      await this.prisma.consultor.update({ where: { id }, data: { ativo: false } });
      return;
    }

    await this.prisma.consultor.delete({ where: { id } });
  }

  /** Usuários que podem ser cadastrados como consultor e ainda não são. */
  async findUsuariosElegiveis(search?: string, limit = 20): Promise<UsuarioElegivelDto[]> {
    const termo = search?.trim();

    const rows = await this.prisma.usuario.findMany({
      where: {
        consultor: { is: null },
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

  async findByEdital(editalId: number): Promise<EditalConsultorResponseDto[]> {
    await this.assertEditalExiste(editalId);

    const [vinculos, cargas] = await Promise.all([
      this.prisma.edital_consultor.findMany({
        where: { edital_id: editalId },
        include: { consultor: { include: consultorInclude } },
        orderBy: { consultor: { usuario: { nome: 'asc' } } },
      }),
      this.cargasNoEdital(editalId),
    ]);

    return vinculos.map(v => ({
      ...this.toResponseDto(v.consultor),
      carga: cargas.get(v.consultor.usuario_id) ?? 0,
      vinculado_em: v.criado_em,
    }));
  }

  async addToEdital(editalId: number, consultorId: number): Promise<EditalConsultorResponseDto> {
    await this.assertEditalExiste(editalId);
    await this.assertConsultoresVinculaveis([consultorId]);

    const vinculo = await this.prisma.edital_consultor.findUnique({
      where: { edital_id_consultor_id: { edital_id: editalId, consultor_id: consultorId } },
      select: { id: true },
    });
    if (vinculo) {
      throw new ConflictException(`O consultor ${consultorId} já está vinculado ao edital.`);
    }

    await this.prisma.edital_consultor.create({
      data: { edital_id: editalId, consultor_id: consultorId },
    });

    const vinculados = await this.findByEdital(editalId);
    return vinculados.find(v => v.id === consultorId)!;
  }

  async removeFromEdital(editalId: number, consultorId: number): Promise<void> {
    await this.assertEditalExiste(editalId);

    const vinculo = await this.prisma.edital_consultor.findUnique({
      where: { edital_id_consultor_id: { edital_id: editalId, consultor_id: consultorId } },
      select: { id: true },
    });
    if (!vinculo) {
      throw new NotFoundException(`O consultor ${consultorId} não está vinculado ao edital.`);
    }

    await this.assertSemAtribuicoesNoEdital(editalId, [consultorId]);
    await this.prisma.edital_consultor.delete({ where: { id: vinculo.id } });
  }

  /** Substitui o conjunto de consultores vinculados ao edital. */
  async setEditalConsultores(
    editalId: number,
    consultorIds: number[],
  ): Promise<EditalConsultorResponseDto[]> {
    await this.assertEditalExiste(editalId);

    const atuais = await this.prisma.edital_consultor.findMany({
      where: { edital_id: editalId },
      select: { consultor_id: true },
    });
    const atuaisIds = new Set(atuais.map(a => a.consultor_id));
    const desejados = new Set(consultorIds);

    const adicionar = consultorIds.filter(id => !atuaisIds.has(id));
    const remover = [...atuaisIds].filter(id => !desejados.has(id));

    await this.assertConsultoresVinculaveis(adicionar);
    await this.assertSemAtribuicoesNoEdital(editalId, remover);

    await this.prisma.$transaction([
      this.prisma.edital_consultor.deleteMany({
        where: { edital_id: editalId, consultor_id: { in: remover } },
      }),
      this.prisma.edital_consultor.createMany({
        data: adicionar.map(consultor_id => ({ edital_id: editalId, consultor_id })),
      }),
    ]);

    return this.findByEdital(editalId);
  }

  // --- Auxiliares ---

  private async getOrFail(id: number): Promise<ConsultorComRelacoes> {
    const consultor = await this.prisma.consultor.findUnique({
      where: { id },
      include: consultorInclude,
    });

    if (!consultor) {
      throw new NotFoundException(`Consultor com id ${id} não encontrado.`);
    }

    return consultor;
  }

  private normalizarAdicionais(areaPrincipalId: number, adicionais: number[] = []): number[] {
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
        `Usuários com a função ${usuario.funcao.nome} não podem ser consultores.`,
      );
    }

    return usuario.docente[0]?.area_conhecimento?.id ?? null;
  }

  private async assertAreasExistem(ids: number[]): Promise<void> {
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

  private async assertConsultoresVinculaveis(ids: number[]): Promise<void> {
    if (!ids.length) return;

    const consultores = await this.prisma.consultor.findMany({
      where: { id: { in: ids } },
      select: { id: true, ativo: true },
    });

    const naoEncontrados = ids.filter(id => !consultores.some(c => c.id === id));
    if (naoEncontrados.length) {
      throw new NotFoundException(`Consultor(es) não encontrado(s): ${naoEncontrados.join(', ')}.`);
    }

    const inativos = consultores.filter(c => !c.ativo).map(c => c.id);
    if (inativos.length) {
      throw new BadRequestException(
        `Consultor(es) inativo(s) não podem ser vinculados: ${inativos.join(', ')}.`,
      );
    }
  }

  /** Impede desvincular consultores que já têm atribuições no edital. */
  private async assertSemAtribuicoesNoEdital(editalId: number, ids: number[]): Promise<void> {
    if (!ids.length) return;

    const comAtribuicoes = await this.prisma.projeto_avaliacao.findMany({
      where: { consultor_id: { in: ids }, projeto_pesquisa: { edital_id: editalId } },
      select: { consultor_id: true },
      distinct: ['consultor_id'],
    });

    if (comAtribuicoes.length) {
      throw new ConflictException(
        `Consultor(es) com atribuições neste edital não podem ser desvinculados: ${comAtribuicoes
          .map(a => a.consultor_id)
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

  private toResponseDto(consultor: ConsultorComRelacoes): ConsultorResponseDto {
    return {
      id: consultor.id,
      usuario: consultor.usuario,
      area_principal: consultor.area_principal,
      areas_adicionais: consultor.areas_adicionais.map(a => a.area_conhecimento),
      is_propesq: consultor.is_propesq,
      is_voluntario: consultor.is_voluntario,
      is_cnpq: consultor.is_cnpq,
      ativo: consultor.ativo,
      criado_em: consultor.criado_em,
      atualizado_em: consultor.atualizado_em,
    };
  }
}
