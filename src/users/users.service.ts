import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { usuario } from '@prisma/client';
import { PaginatedDto } from '../common/dto/paginated.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const funcao = await this.prisma.funcao.findUnique({
      where: { id: createUserDto.funcao_id },
    });

    if (!funcao) {
      throw new NotFoundException(`Função com ID ${createUserDto.funcao_id} não encontrada`);
    }

    return this.prisma.usuario.create({
      data: {
        ...createUserDto,
        criado_em: new Date(),
        atualizado_em: new Date(),
      },
    });
  }

  async findAll(limit: number, offset: number): Promise<PaginatedDto<usuario>> {
    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({
        take: limit,
        skip: offset,
        orderBy: { criado_em: 'desc' },
        include: { funcao: true },
      }),
      this.prisma.usuario.count(),
    ]);

    return {
      total,
      limit,
      offset,
      results: data,
    };
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { funcao: true },
    });

    if (!usuario) throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    return usuario;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: {
        ...updateUserDto,
        atualizado_em: new Date(),
      },
      include: { funcao: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.delete({
      where: { id },
      include: { funcao: true },
    });
  }

  async findByEmail(email: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { email },
    });

    if (!usuario) throw new NotFoundException(`Usuário com email ${email} não encontrado`);
    return usuario;
  }
}
