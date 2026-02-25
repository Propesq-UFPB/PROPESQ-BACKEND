import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PaginatedDto } from '../users/dto/paginated.dto';
import { cronograma } from '@prisma/client';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const atividade = await this.prisma.atividade.findUnique({
      where: { id: createScheduleDto.atividade_id },
    });

    if (!atividade) {
      throw new NotFoundException(
        `Atividade com ID ${createScheduleDto.atividade_id} não encontrada`,
      );
    }

    return this.prisma.cronograma.create({
      data: {
        data_inicio: new Date(createScheduleDto.data_inicio),
        data_fim: new Date(createScheduleDto.data_fim),
        atividade_id: createScheduleDto.atividade_id,
      },
      include: { atividade: true },
    });
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedDto<cronograma>> {
    const [data, total] = await Promise.all([
      this.prisma.cronograma.findMany({
        take: limit,
        skip: offset,
        orderBy: { data_inicio: 'asc' },
        include: { atividade: true },
      }),
      this.prisma.cronograma.count(),
    ]);

    return {
      total,
      limit,
      offset,
      results: data,
    };
  }

  async findOne(id: number) {
    const cronograma = await this.prisma.cronograma.findUnique({
      where: { id },
      include: { atividade: true },
    });

    if (!cronograma)
      throw new NotFoundException(`Cronograma com ID ${id} não encontrado`);
    return cronograma;
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    await this.findOne(id);

    if (updateScheduleDto.atividade_id) {
      const atividade = await this.prisma.atividade.findUnique({
        where: { id: updateScheduleDto.atividade_id },
      });

      if (!atividade) {
        throw new NotFoundException(
          `Atividade com ID ${updateScheduleDto.atividade_id} não encontrada`,
        );
      }
    }

    return this.prisma.cronograma.update({
      where: { id },
      data: {
        ...(updateScheduleDto.data_inicio && {
          data_inicio: new Date(updateScheduleDto.data_inicio),
        }),
        ...(updateScheduleDto.data_fim && {
          data_fim: new Date(updateScheduleDto.data_fim),
        }),
        ...(updateScheduleDto.atividade_id && {
          atividade_id: updateScheduleDto.atividade_id,
        }),
      },
      include: { atividade: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cronograma.delete({
      where: { id },
      include: { atividade: true },
    });
  }
}
