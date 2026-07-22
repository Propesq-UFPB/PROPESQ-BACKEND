import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { funcao_projeto, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { CreateProjectRoleDto } from './dto/create-project-role.dto';
import { UpdateProjectRoleDto } from './dto/update-project-role.dto';
import { ProjectRoleResponseDto } from './dto/project-role-response.dto';
import { ProjectRoleLookupDto } from './dto/project-role-lookup.dto';

@Injectable()
export class ProjectRolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateProjectRoleDto): Promise<ProjectRoleResponseDto> {
    try {
      const created = await this.prisma.funcao_projeto.create({
        data: {
          nome: createDto.nome.trim(),
          categoria: createDto.categoria,
          descricao: createDto.descricao?.trim() || null,
          ativo: createDto.ativo ?? true,
        },
      });
      return this.toResponseDto(created);
    } catch (error) {
      this.rethrowUniqueConflict(error, createDto.nome);
      throw error;
    }
  }

  async findAll(
    limit: number,
    offset: number,
    ativo?: boolean,
  ): Promise<PaginatedResult<ProjectRoleResponseDto>> {
    const where: Prisma.funcao_projetoWhereInput = ativo !== undefined ? { ativo } : {};

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.funcao_projeto.count({ where }),
      this.prisma.funcao_projeto.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: rows.map(row => this.toResponseDto(row)),
    };
  }

  async getLookup(): Promise<ProjectRoleLookupDto[]> {
    const rows = await this.prisma.funcao_projeto.findMany({
      where: { ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });

    return rows.map(row => ({ id: row.id, name: row.nome }));
  }

  async findOne(id: number): Promise<ProjectRoleResponseDto> {
    const role = await this.prisma.funcao_projeto.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Função de projeto com id ${id} não encontrada.`);
    }

    return this.toResponseDto(role);
  }

  async update(id: number, updateDto: UpdateProjectRoleDto): Promise<ProjectRoleResponseDto> {
    await this.findOne(id);

    try {
      const updated = await this.prisma.funcao_projeto.update({
        where: { id },
        data: {
          ...(updateDto.nome !== undefined && { nome: updateDto.nome.trim() }),
          ...(updateDto.categoria !== undefined && { categoria: updateDto.categoria }),
          ...(updateDto.descricao !== undefined && {
            descricao: updateDto.descricao?.trim() || null,
          }),
          ...(updateDto.ativo !== undefined && { ativo: updateDto.ativo }),
        },
      });
      return this.toResponseDto(updated);
    } catch (error) {
      this.rethrowUniqueConflict(error, updateDto.nome);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const membersCount = await this.prisma.membro_projeto.count({
      where: { funcao_projeto_id: id },
    });

    if (membersCount > 0) {
      throw new ConflictException(
        'Não é possível remover a função: ela está em uso em membros de projeto.',
      );
    }

    await this.prisma.funcao_projeto.delete({
      where: { id },
    });
  }

  private rethrowUniqueConflict(error: unknown, nome?: string): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException(
        nome
          ? `Já existe uma função de projeto com o nome "${nome}".`
          : 'Já existe uma função de projeto com esse nome.',
      );
    }
  }

  private toResponseDto(role: funcao_projeto): ProjectRoleResponseDto {
    return {
      id: role.id,
      nome: role.nome,
      descricao: role.descricao,
      categoria: role.categoria,
      ativo: role.ativo,
      criado_em: role.criado_em.toISOString(),
      atualizado_em: role.atualizado_em.toISOString(),
    };
  }
}
