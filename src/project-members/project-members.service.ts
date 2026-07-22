import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { ProjectMemberResponseDto } from './dto/project-member-response.dto';

type MemberWithRelations = Prisma.membro_projetoGetPayload<{
  include: { usuario: true; funcao_projeto: true };
}>;

@Injectable()
export class ProjectMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectMemberDto): Promise<ProjectMemberResponseDto> {
    await this.ensureProjectExists(dto.projeto_pesquisa_id);
    await this.ensureUsuarioExists(dto.usuario_id);
    await this.ensureFuncaoExists(dto.funcao_projeto_id);

    try {
      const created = await this.prisma.membro_projeto.create({
        data: {
          projeto_pesquisa_id: dto.projeto_pesquisa_id,
          usuario_id: dto.usuario_id,
          funcao_projeto_id: dto.funcao_projeto_id,
          ativo: dto.ativo ?? true,
        },
        include: { usuario: true, funcao_projeto: true },
      });
      return this.toResponseDto(created);
    } catch (error) {
      this.rethrowUniqueConflict(error);
      throw error;
    }
  }

  async findAll(
    limit: number,
    offset: number,
    projetoPesquisaId?: number,
  ): Promise<PaginatedResult<ProjectMemberResponseDto>> {
    const where: Prisma.membro_projetoWhereInput =
      projetoPesquisaId !== undefined
        ? { projeto_pesquisa_id: projetoPesquisaId }
        : {};

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.membro_projeto.count({ where }),
      this.prisma.membro_projeto.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { id: 'desc' },
        include: { usuario: true, funcao_projeto: true },
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: rows.map(row => this.toResponseDto(row)),
    };
  }

  async findOne(id: number): Promise<ProjectMemberResponseDto> {
    const member = await this.prisma.membro_projeto.findUnique({
      where: { id },
      include: { usuario: true, funcao_projeto: true },
    });

    if (!member) {
      throw new NotFoundException(`Membro de projeto com id ${id} não encontrado.`);
    }

    return this.toResponseDto(member);
  }

  async update(
    id: number,
    dto: UpdateProjectMemberDto,
  ): Promise<ProjectMemberResponseDto> {
    await this.findOne(id);

    if (dto.funcao_projeto_id !== undefined) {
      await this.ensureFuncaoExists(dto.funcao_projeto_id);
    }

    try {
      const updated = await this.prisma.membro_projeto.update({
        where: { id },
        data: {
          ...(dto.funcao_projeto_id !== undefined && {
            funcao_projeto_id: dto.funcao_projeto_id,
          }),
          ...(dto.ativo !== undefined && { ativo: dto.ativo }),
        },
        include: { usuario: true, funcao_projeto: true },
      });
      return this.toResponseDto(updated);
    } catch (error) {
      this.rethrowUniqueConflict(error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.membro_projeto.delete({ where: { id } });
  }

  private async ensureProjectExists(id: number): Promise<void> {
    const project = await this.prisma.projeto_pesquisa.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Projeto com id ${id} não encontrado.`);
    }
  }

  private async ensureUsuarioExists(id: number): Promise<void> {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado.`);
    }
  }

  private async ensureFuncaoExists(id: number): Promise<void> {
    const role = await this.prisma.funcao_projeto.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Função de projeto com id ${id} não encontrada.`);
    }
  }

  private rethrowUniqueConflict(error: unknown): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException(
        'Já existe um membro com essa função neste projeto para o usuário informado.',
      );
    }
  }

  private toResponseDto(row: MemberWithRelations): ProjectMemberResponseDto {
    return {
      id: row.id,
      projeto_pesquisa_id: row.projeto_pesquisa_id,
      usuario_id: row.usuario_id,
      funcao_projeto_id: row.funcao_projeto_id,
      ativo: row.ativo,
      criado_em: row.criado_em.toISOString(),
      usuario_nome: row.usuario.nome,
      funcao_nome: row.funcao_projeto.nome,
    };
  }
}
