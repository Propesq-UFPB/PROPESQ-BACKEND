import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AvaliadorListResponseDto, AvaliadorResponseDto } from './dto/avaliador-response.dto';
import { CreateAvaliadorDto } from './dto/create-avaliador.dto';
import { ListAvaliadoresQueryDto } from './dto/list-avaliadores-query.dto';
import { UpdateAvaliadorDto } from './dto/update-avaliador.dto';

const avaliadorInclude = {
  usuario: { select: { id: true, nome: true, email: true } }, // nunca incluir a senha
  area_principal: true,
  areas_adicionais: { include: { area_conhecimento: true }, orderBy: { id: 'asc' } },
} satisfies Prisma.avaliadorInclude;

type AvaliadorComRelacoes = Prisma.avaliadorGetPayload<{ include: typeof avaliadorInclude }>;

@Injectable()
export class AvaliadoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateAvaliadorDto): Promise<AvaliadorResponseDto> {
    const areasAdicionais = createDto.areas_adicionais_ids ?? [];

    if (areasAdicionais.includes(createDto.area_conhecimento_principal_id)) {
      throw new BadRequestException('A área principal não pode repetir nas áreas adicionais.');
    }

    await this.assertUsuarioDisponivel(createDto.usuario_id);
    await this.assertAreasExistem([createDto.area_conhecimento_principal_id, ...areasAdicionais]);

    try {
      const created = await this.prisma.avaliador.create({
        data: {
          usuario_id: createDto.usuario_id,
          area_conhecimento_principal_id: createDto.area_conhecimento_principal_id,
          ativo: createDto.ativo ?? true,
          is_propesq: createDto.is_propesq ?? false,
          is_voluntario: createDto.is_voluntario ?? false,
          areas_adicionais: {
            create: areasAdicionais.map(area_conhecimento_id => ({ area_conhecimento_id })),
          },
        },
        include: avaliadorInclude,
      });
      return this.toResponseDto(created);
    } catch (error) {
      this.rethrowUniqueConflict(error);
      throw error;
    }
  }
  async findAll(query: ListAvaliadoresQueryDto): Promise<AvaliadorListResponseDto> {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const where: Prisma.avaliadorWhereInput = {
      ativo: query.ativo,
      is_propesq: query.is_propesq,
      is_voluntario: query.is_voluntario,
      area_conhecimento_principal_id: query.area_principal_id,
      areas_adicionais:
        query.area_adicional_id === undefined
          ? undefined
          : { some: { area_conhecimento_id: query.area_adicional_id } },
    };

    const [avaliadores, total] = await this.prisma.$transaction([
      this.prisma.avaliador.findMany({
        where,
        include: avaliadorInclude,
        orderBy: [{ usuario: { nome: 'asc' } }, { id: 'asc' }],
        take: limit,
        skip: offset,
      }),
      this.prisma.avaliador.count({ where }),
    ]);

    return {
      total,
      limit,
      offset,
      results: avaliadores.map(avaliador => this.toResponseDto(avaliador)),
    };
  }

  async findOne(id: number): Promise<AvaliadorResponseDto> {
    const avaliador = await this.prisma.avaliador.findUnique({
      where: { id },
      include: avaliadorInclude,
    });

    if (!avaliador) {
      throw new NotFoundException(`Avaliador com id ${id} não encontrado.`);
    }

    return this.toResponseDto(avaliador);
  }

  async update(id: number, updateDto: UpdateAvaliadorDto): Promise<AvaliadorResponseDto> {
    const atual = await this.prisma.avaliador.findUnique({
      where: { id },
      include: { areas_adicionais: { select: { area_conhecimento_id: true } } },
    });

    if (!atual) {
      throw new NotFoundException(`Avaliador com id ${id} não encontrado.`);
    }

    const principalEnviada = updateDto.area_conhecimento_principal_id ?? undefined;
    const adicionaisEnviadas = updateDto.areas_adicionais_ids ?? undefined;

    const principalFinal = principalEnviada ?? atual.area_conhecimento_principal_id;
    const adicionaisFinais =
      adicionaisEnviadas ?? atual.areas_adicionais.map(item => item.area_conhecimento_id);

    if (adicionaisFinais.includes(principalFinal)) {
      throw new BadRequestException('A área principal não pode estar entre as áreas adicionais.');
    }

    const idsParaConferir = [
      ...(principalEnviada === undefined ? [] : [principalEnviada]),
      ...(adicionaisEnviadas ?? []),
    ];
    if (idsParaConferir.length > 0) {
      await this.assertAreasExistem(idsParaConferir);
    }

    const atualizado = await this.prisma.avaliador.update({
      where: { id },
      data: {
        area_conhecimento_principal_id: principalEnviada,
        ativo: updateDto.ativo ?? undefined,
        is_propesq: updateDto.is_propesq ?? undefined,
        is_voluntario: updateDto.is_voluntario ?? undefined,
        areas_adicionais:
          adicionaisEnviadas === undefined
            ? undefined
            : {
                deleteMany: {},
                create: adicionaisEnviadas.map(area_conhecimento_id => ({ area_conhecimento_id })),
              },
      },
      include: avaliadorInclude,
    });

    return this.toResponseDto(atualizado);
  }

  private async assertUsuarioDisponivel(usuarioId: number): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, avaliador: { select: { id: true } } },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com id ${usuarioId} não encontrado.`);
    }

    if (usuario.avaliador) {
      throw new ConflictException('Este usuário já está cadastrado como avaliador.');
    }
  }

  private async assertAreasExistem(ids: number[]): Promise<void> {
    const encontradas = await this.prisma.area_conhecimento.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    if (encontradas.length !== ids.length) {
      const achadas = new Set(encontradas.map(area => area.id));
      const faltando = ids.filter(id => !achadas.has(id));
      throw new NotFoundException(
        `Área(s) de conhecimento não encontrada(s): ${faltando.join(', ')}.`,
      );
    }
  }

  private rethrowUniqueConflict(error: unknown): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Este usuário já está cadastrado como avaliador.');
    }
  }

  private toResponseDto(avaliador: AvaliadorComRelacoes): AvaliadorResponseDto {
    return {
      id: avaliador.id,
      usuario: avaliador.usuario,
      area_principal: avaliador.area_principal,
      areas_adicionais: avaliador.areas_adicionais.map(item => item.area_conhecimento),
      ativo: avaliador.ativo,
      is_propesq: avaliador.is_propesq,
      is_voluntario: avaliador.is_voluntario,
      atualizado_em: avaliador.atualizado_em.toISOString(),
    };
  }
}
