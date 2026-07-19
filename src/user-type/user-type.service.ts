import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, tipo_usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';
import { UserTypeResponseDto } from './dto/user-type-response.dto';
import { UserTypeLookupDto } from './dto/user-type-lookup.dto';
import { PaginatedResult } from '../common/dto/paginated.dto';

@Injectable()
export class UserTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserTypeDto): Promise<UserTypeResponseDto> {
    try {
      const created = await this.prisma.tipo_usuario.create({
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          publicos: dto.publicos,
        },
      });

      return this.toResponseDto(created);
    } catch (error) {
      this.throwNameConflict(error, dto.nome);
      throw error;
    }
  }

  async findAll(limit: number, offset: number): Promise<PaginatedResult<UserTypeResponseDto>> {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.tipo_usuario.count(),
      this.prisma.tipo_usuario.findMany({
        take: limit,
        skip: offset,
        orderBy: { id: 'asc' },
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: rows.map(row => this.toResponseDto(row)),
    };
  }

  async getLookup(): Promise<UserTypeLookupDto[]> {
    const rows = await this.prisma.tipo_usuario.findMany({
      where: { ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });

    return rows.map(row => ({ id: row.id, name: row.nome }));
  }

  async findOne(id: number): Promise<UserTypeResponseDto> {
    const row = await this.prisma.tipo_usuario.findUnique({ where: { id } });

    if (!row) {
      throw new NotFoundException(`Tipo de usuário com id ${id} não encontrado.`);
    }

    return this.toResponseDto(row);
  }

  async update(id: number, dto: UpdateUserTypeDto): Promise<UserTypeResponseDto> {
    await this.findOne(id);

    try {
      const updated = await this.prisma.tipo_usuario.update({
        where: { id },
        data: dto,
      });

      return this.toResponseDto(updated);
    } catch (error) {
      this.throwNameConflict(error, dto.nome);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.tipo_usuario.delete({ where: { id } });
  }

  private throwNameConflict(error: unknown, nome?: string): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException(
        nome
          ? `Já existe um tipo de usuário com o nome "${nome}".`
          : 'Já existe um tipo de usuário com dados únicos já cadastrados.',
      );
    }
  }

  private toResponseDto(row: tipo_usuario): UserTypeResponseDto {
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      publicos: row.publicos,
      ativo: row.ativo,
    };
  }
}
