import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedDto } from '../users/dto/paginated.dto';
import { plano_trabalho } from '@prisma/client';
import { WorkPlanCreationDto } from './dto/create-work-plan.dto';
import { WorkPlanUpdateDto } from './dto/update-work-plan.dto';

@Injectable()
export class WorkPlanService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkPlanDto: WorkPlanCreationDto) {
    // Validate that all foreign keys exist
    const [discente, usuario, cronograma, corpo] = await Promise.all([
      this.prisma.discente.findUnique({
        where: { id: createWorkPlanDto.discente_id },
      }),
      this.prisma.usuario.findUnique({
        where: { id: createWorkPlanDto.usuario_id },
      }),
      this.prisma.cronograma.findUnique({
        where: { id: createWorkPlanDto.cronograma_id },
      }),
      this.prisma.corpo_plano_trabalho.findUnique({
        where: { id: createWorkPlanDto.corpo_id },
      }),
    ]);

    if (!discente) {
      throw new NotFoundException(
        `Discente com ID ${createWorkPlanDto.discente_id} não encontrado`,
      );
    }

    if (!usuario) {
      throw new NotFoundException(
        `Usuário com ID ${createWorkPlanDto.usuario_id} não encontrado`,
      );
    }

    if (!cronograma) {
      throw new NotFoundException(
        `Cronograma com ID ${createWorkPlanDto.cronograma_id} não encontrado`,
      );
    }

    if (!corpo) {
      throw new NotFoundException(
        `Corpo do plano de trabalho com ID ${createWorkPlanDto.corpo_id} não encontrado`,
      );
    }

    return this.prisma.plano_trabalho.create({
      data: createWorkPlanDto,
      include: {
        discente: {
          include: {
            usuario: true,
          },
        },
        usuario: true,
        cronograma: {
          include: {
            atividade: true,
          },
        },
        corpo_plano_trabalho: true,
        projeto_pesquisa: true,
      },
    });
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedDto<plano_trabalho>> {
    const [data, total] = await Promise.all([
      this.prisma.plano_trabalho.findMany({
        take: limit,
        skip: offset,
        orderBy: { id: 'desc' },
        include: {
          discente: {
            include: {
              usuario: true,
            },
          },
          usuario: true,
          cronograma: {
            include: {
              atividade: true,
            },
          },
          corpo_plano_trabalho: true,
          projeto_pesquisa: true,
        },
      }),
      this.prisma.plano_trabalho.count(),
    ]);

    return {
      total,
      limit,
      offset,
      results: data,
    };
  }

  async findOne(id: number) {
    const planoTrabalho = await this.prisma.plano_trabalho.findUnique({
      where: { id },
      include: {
        discente: {
          include: {
            usuario: true,
          },
        },
        usuario: true,
        cronograma: {
          include: {
            atividade: true,
          },
        },
        corpo_plano_trabalho: true,
        projeto_pesquisa: true,
      },
    });

    if (!planoTrabalho)
      throw new NotFoundException(
        `Plano de trabalho com ID ${id} não encontrado`,
      );

    return planoTrabalho;
  }

  async update(id: number, updatePlanoTrabalhoDto: WorkPlanUpdateDto) {
    // Verify the plano_trabalho exists
    await this.findOne(id);

    // Validate foreign keys if they are being updated
    if (updatePlanoTrabalhoDto.discente_id) {
      const discente = await this.prisma.discente.findUnique({
        where: { id: updatePlanoTrabalhoDto.discente_id },
      });

      if (!discente) {
        throw new NotFoundException(
          `Discente com ID ${updatePlanoTrabalhoDto.discente_id} não encontrado`,
        );
      }
    }

    if (updatePlanoTrabalhoDto.usuario_id) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: updatePlanoTrabalhoDto.usuario_id },
      });

      if (!usuario) {
        throw new NotFoundException(
          `Usuário com ID ${updatePlanoTrabalhoDto.usuario_id} não encontrado`,
        );
      }
    }

    if (updatePlanoTrabalhoDto.cronograma_id) {
      const cronograma = await this.prisma.cronograma.findUnique({
        where: { id: updatePlanoTrabalhoDto.cronograma_id },
      });

      if (!cronograma) {
        throw new NotFoundException(
          `Cronograma com ID ${updatePlanoTrabalhoDto.cronograma_id} não encontrado`,
        );
      }
    }

    if (updatePlanoTrabalhoDto.corpo_id) {
      const corpo = await this.prisma.corpo_plano_trabalho.findUnique({
        where: { id: updatePlanoTrabalhoDto.corpo_id },
      });

      if (!corpo) {
        throw new NotFoundException(
          `Corpo do plano de trabalho com ID ${updatePlanoTrabalhoDto.corpo_id} não encontrado`,
        );
      }
    }

    return this.prisma.plano_trabalho.update({
      where: { id },
      data: updatePlanoTrabalhoDto,
      include: {
        discente: {
          include: {
            usuario: true,
          },
        },
        usuario: true,
        cronograma: {
          include: {
            atividade: true,
          },
        },
        corpo_plano_trabalho: true,
        projeto_pesquisa: true,
      },
    });
  }

  async remove(id: number) {
    // Verify the plano_trabalho exists
    await this.findOne(id);

    // Check if there are any projeto_pesquisa records referencing this plano_trabalho
    const projetosCount = await this.prisma.projeto_pesquisa.count({
      where: { plano_trabalho_id: id },
    });

    if (projetosCount > 0) {
      throw new BadRequestException(
        `Não é possível deletar o plano de trabalho com ID ${id} pois existem ${projetosCount} projeto(s) de pesquisa associado(s)`,
      );
    }

    return this.prisma.plano_trabalho.delete({
      where: { id },
      include: {
        discente: {
          include: {
            usuario: true,
          },
        },
        usuario: true,
        cronograma: {
          include: {
            atividade: true,
          },
        },
        corpo_plano_trabalho: true,
        projeto_pesquisa: true,
      },
    });
  }
}
