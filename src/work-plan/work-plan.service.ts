import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { CreateWorkPlanDto } from './dto/create-work-plan.dto';
import {
  UpdateActivityWorkPlanDto,
  UpdateBodyWorkPlanDto,
  UpdateMonthWorkPlanDto,
  UpdateWorkPlanDto,
} from './dto/update-work-plan.dto';

@Injectable()
export class WorkPlanService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkPlanDto: CreateWorkPlanDto) {
    await this.validateForeignKeys(
      createWorkPlanDto.discente_id,
      createWorkPlanDto.usuario_id,
      createWorkPlanDto.pesquisa_id,
    );

    const workPlan = await this.prisma.$transaction(async (tx) => {
      const createdWorkPlan = await tx.plano_trabalho.create({
        data: {
          discente_id: createWorkPlanDto.discente_id,
          usuario_id: createWorkPlanDto.usuario_id,
          pesquisa_id: createWorkPlanDto.pesquisa_id,
          modalidade: createWorkPlanDto.modalidade,
          status: createWorkPlanDto.status,
          tipo_bolsa: createWorkPlanDto.tipo_bolsa,
          cronograma_id: createWorkPlanDto.cronograma_id,
          direcionamento_plano: createWorkPlanDto.direcionamento_plano,
          corpo_id: createWorkPlanDto.corpo_id,
        },
        include: this.defaultInclude(),
      });

      const body = await tx.corpo_plano_trabalho.create({
        data: {
          ...createWorkPlanDto.corpo_plano_trabalho,
          plano_trabalho_id: createdWorkPlan.id,
        },
      });

      await tx.plano_trabalho.update({
        where: { id: createdWorkPlan.id },
        data: { corpo_id: body.id },
      });

      await this.syncActivitiesWithSql(
        createdWorkPlan.id,
        createWorkPlanDto.atividades,
        tx,
      );

      return createdWorkPlan;
    });

    return this.findOne(workPlan.id);
  }

  async findAll(limit: number, offset: number): Promise<PaginatedDto<any>> {
    const [rawData, total] = await Promise.all([
      this.prisma.plano_trabalho.findMany({
        take: limit,
        skip: offset,
        orderBy: { id: 'desc' },
        include: this.defaultInclude(),
      }),
      this.prisma.plano_trabalho.count(),
    ]);

    const data = await this.attachActivitiesAndMonths(rawData);

    return {
      total,
      limit,
      offset,
      results: data,
    };
  }

  async findOne(id: number) {
    const rawWorkPlan = await this.prisma.plano_trabalho.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });

    if (!rawWorkPlan) {
      throw new NotFoundException(
        `Plano de trabalho com ID ${id} não encontrado`,
      );
    }

    const [workPlan] = await this.attachActivitiesAndMonths([rawWorkPlan]);

    return workPlan;
  }

  async update(id: number, updateWorkPlanDto: UpdateWorkPlanDto) {
    const workPlan = await this.findOne(id);

    if (
      updateWorkPlanDto.discente_id ||
      updateWorkPlanDto.usuario_id ||
      updateWorkPlanDto.pesquisa_id
    ) {
      await this.validateForeignKeys(
        updateWorkPlanDto.discente_id ?? workPlan.discente_id,
        updateWorkPlanDto.usuario_id ?? workPlan.usuario_id,
        updateWorkPlanDto.pesquisa_id ?? workPlan.projeto_pesquisa?.[0]?.id,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.plano_trabalho.update({
        where: { id },
        data: {
          ...(updateWorkPlanDto.discente_id !== undefined && {
            discente_id: updateWorkPlanDto.discente_id,
          }),
          ...(updateWorkPlanDto.usuario_id !== undefined && {
            usuario_id: updateWorkPlanDto.usuario_id,
          }),
          ...(updateWorkPlanDto.pesquisa_id !== undefined && {
            pesquisa_id: updateWorkPlanDto.pesquisa_id,
          }),
          ...(updateWorkPlanDto.modalidade !== undefined && {
            modalidade: updateWorkPlanDto.modalidade,
          }),
          ...(updateWorkPlanDto.status !== undefined && {
            status: updateWorkPlanDto.status,
          }),
          ...(updateWorkPlanDto.tipo_bolsa !== undefined && {
            tipo_bolsa: updateWorkPlanDto.tipo_bolsa,
          }),
          ...(updateWorkPlanDto.cronograma_id !== undefined && {
            cronograma_id: updateWorkPlanDto.cronograma_id,
          }),
          ...(updateWorkPlanDto.direcionamento_plano !== undefined && {
            direcionamento_plano: updateWorkPlanDto.direcionamento_plano,
          }),
          ...(updateWorkPlanDto.corpo_id !== undefined && {
            corpo_id: updateWorkPlanDto.corpo_id,
          }),
        },
      });

      if (updateWorkPlanDto.corpo_plano_trabalho) {
        await this.syncBodyPlan(
          tx,
          id,
          workPlan.corpo_id,
          updateWorkPlanDto.corpo_plano_trabalho,
        );
      }

      if (Array.isArray(updateWorkPlanDto.atividades)) {
        await this.syncActivitiesWithSql(id, updateWorkPlanDto.atividades, tx);
      }
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.plano_trabalho.delete({
      where: { id },
      include: this.defaultInclude(),
    });
  }

  private async validateForeignKeys(
    discente_id: number,
    usuario_id: number,
    pesquisa_id?: number,
  ) {
    const [discente, usuario, projeto] = await Promise.all([
      this.prisma.discente.findUnique({ where: { id: discente_id } }),
      this.prisma.usuario.findUnique({ where: { id: usuario_id } }),
      pesquisa_id
        ? this.prisma.projeto_pesquisa.findUnique({
            where: { id: pesquisa_id },
          })
        : Promise.resolve(null),
    ]);

    if (!discente) {
      throw new NotFoundException(
        `Discente com ID ${discente_id} não encontrado`,
      );
    }

    if (!usuario) {
      throw new NotFoundException(
        `Usuário com ID ${usuario_id} não encontrado`,
      );
    }

    if (pesquisa_id && !projeto) {
      throw new NotFoundException(
        `Projeto de pesquisa com ID ${pesquisa_id} não encontrado`,
      );
    }
  }

  private async syncBodyPlan(
    tx: Prisma.TransactionClient,
    workPlanId: number,
    corpoId: number,
    bodyDto: UpdateBodyWorkPlanDto,
  ) {
    const existingBody = await tx.corpo_plano_trabalho.findUnique({
      where: { id: corpoId },
    });

    if (existingBody) {
      await tx.corpo_plano_trabalho.update({
        where: { id: corpoId },
        data: {
          ...(bodyDto.titulo !== undefined && { titulo: bodyDto.titulo }),
          ...(bodyDto.introducao !== undefined && {
            introducao: bodyDto.introducao,
          }),
          ...(bodyDto.objetivos !== undefined && {
            objetivos: bodyDto.objetivos,
          }),
          ...(bodyDto.metodologia !== undefined && {
            metodologia: bodyDto.metodologia,
          }),
          ...(bodyDto.referencias !== undefined && {
            referencias: bodyDto.referencias,
          }),
        },
      });

      return;
    }

    const fullBody = this.ensureBodyFields(bodyDto);
    if (!fullBody) {
      throw new BadRequestException(
        'Para criar corpo_plano_trabalho, envie todos os campos obrigatórios.',
      );
    }

    await tx.corpo_plano_trabalho.create({
      data: {
        ...fullBody,
        plano_trabalho_id: workPlanId,
      },
    });
  }

  private async syncActivitiesWithSql(
    workPlanId: number,
    atividadesDto: UpdateActivityWorkPlanDto[],
    tx: Prisma.TransactionClient | PrismaService,
  ) {
    const existingActivities = await tx.$queryRawUnsafe<Array<{ id: number }>>(
      'SELECT id FROM atividade_plano_trabalho WHERE plano_trabalho_id = $1',
      workPlanId,
    );

    const existingActivityIds = existingActivities.map(
      (atividade) => atividade.id,
    );
    const incomingExistingIds = atividadesDto
      .filter((atividade) => atividade.id !== undefined)
      .map((atividade) => atividade.id as number);

    const invalidActivityIds = incomingExistingIds.filter(
      (atividadeId) => !existingActivityIds.includes(atividadeId),
    );

    if (invalidActivityIds.length > 0) {
      throw new NotFoundException(
        `Atividade(s) do plano não encontrada(s): ${invalidActivityIds.join(', ')}`,
      );
    }

    if (incomingExistingIds.length === 0) {
      await tx.$executeRawUnsafe(
        'DELETE FROM atividade_plano_trabalho WHERE plano_trabalho_id = $1',
        workPlanId,
      );
    } else {
      await tx.$executeRawUnsafe(
        'DELETE FROM atividade_plano_trabalho WHERE plano_trabalho_id = $1 AND id <> ALL($2::int[])',
        workPlanId,
        incomingExistingIds,
      );
    }

    for (const atividadeDto of atividadesDto) {
      if (atividadeDto.id) {
        if (atividadeDto.descricao !== undefined) {
          await tx.$executeRawUnsafe(
            'UPDATE atividade_plano_trabalho SET descricao = $1 WHERE id = $2',
            atividadeDto.descricao,
            atividadeDto.id,
          );
        }

        if (Array.isArray(atividadeDto.meses)) {
          await this.syncMonthsWithSql(tx, atividadeDto.id, atividadeDto.meses);
        }

        continue;
      }

      if (!atividadeDto.descricao) {
        throw new BadRequestException(
          'O campo descricao é obrigatório ao criar uma nova atividade.',
        );
      }

      const insertedActivity = await tx.$queryRawUnsafe<Array<{ id: number }>>(
        'INSERT INTO atividade_plano_trabalho (descricao, plano_trabalho_id) VALUES ($1, $2) RETURNING id',
        atividadeDto.descricao,
        workPlanId,
      );

      const activityId = insertedActivity[0]?.id;
      if (!activityId) {
        throw new BadRequestException(
          'Não foi possível criar a atividade do plano.',
        );
      }

      if (Array.isArray(atividadeDto.meses)) {
        await this.syncMonthsWithSql(tx, activityId, atividadeDto.meses);
      }
    }
  }

  private async syncMonthsWithSql(
    tx: Prisma.TransactionClient | PrismaService,
    activityId: number,
    monthsDto: UpdateMonthWorkPlanDto[],
  ) {
    const existingMonths = await tx.$queryRawUnsafe<Array<{ id: number }>>(
      'SELECT id FROM mes_plano_trabalho WHERE atividade_id = $1',
      activityId,
    );

    const existingMonthIds = existingMonths.map((mes) => mes.id);
    const incomingExistingIds = monthsDto
      .filter((mes) => mes.id !== undefined)
      .map((mes) => mes.id as number);

    const invalidMonthIds = incomingExistingIds.filter(
      (monthId) => !existingMonthIds.includes(monthId),
    );

    if (invalidMonthIds.length > 0) {
      throw new NotFoundException(
        `Mês(es) da atividade não encontrado(s): ${invalidMonthIds.join(', ')}`,
      );
    }

    if (incomingExistingIds.length === 0) {
      await tx.$executeRawUnsafe(
        'DELETE FROM mes_plano_trabalho WHERE atividade_id = $1',
        activityId,
      );
    } else {
      await tx.$executeRawUnsafe(
        'DELETE FROM mes_plano_trabalho WHERE atividade_id = $1 AND id <> ALL($2::int[])',
        activityId,
        incomingExistingIds,
      );
    }

    for (const monthDto of monthsDto) {
      if (monthDto.id) {
        if (monthDto.data === undefined) {
          continue;
        }

        await tx.$executeRawUnsafe(
          'UPDATE mes_plano_trabalho SET data = $1 WHERE id = $2',
          new Date(monthDto.data),
          monthDto.id,
        );

        continue;
      }

      if (!monthDto.data) {
        throw new BadRequestException(
          'O campo data é obrigatório ao criar um novo mês.',
        );
      }

      await tx.$executeRawUnsafe(
        'INSERT INTO mes_plano_trabalho (data, atividade_id) VALUES ($1, $2)',
        new Date(monthDto.data),
        activityId,
      );
    }
  }

  private ensureBodyFields(bodyDto: UpdateBodyWorkPlanDto) {
    if (
      !bodyDto.titulo ||
      !bodyDto.introducao ||
      !bodyDto.objetivos ||
      !bodyDto.metodologia ||
      !bodyDto.referencias
    ) {
      return null;
    }

    return {
      titulo: bodyDto.titulo,
      introducao: bodyDto.introducao,
      objetivos: bodyDto.objetivos,
      metodologia: bodyDto.metodologia,
      referencias: bodyDto.referencias,
    };
  }

  private defaultInclude() {
    return {
      corpo_plano_trabalho: true,
      discente: true,
      usuario: true,
      projeto_pesquisa: true,
    };
  }

  private async attachActivitiesAndMonths<T extends { id: number }>(
    plans: T[],
  ): Promise<any[]> {
    if (plans.length === 0) {
      return plans;
    }

    const planIds = plans.map((plan) => plan.id);
    const activities = await this.prisma.$queryRawUnsafe<
      Array<{ id: number; descricao: string; plano_trabalho_id: number }>
    >(
      'SELECT id, descricao, plano_trabalho_id FROM atividade_plano_trabalho WHERE plano_trabalho_id = ANY($1::int[]) ORDER BY id ASC',
      planIds,
    );

    const activityIds = activities.map((activity) => activity.id);
    const months =
      activityIds.length > 0
        ? await this.prisma.$queryRawUnsafe<
            Array<{ id: number; data: Date; atividade_id: number }>
          >(
            'SELECT id, data, atividade_id FROM mes_plano_trabalho WHERE atividade_id = ANY($1::int[]) ORDER BY id ASC',
            activityIds,
          )
        : [];

    const monthsByActivity = new Map<
      number,
      Array<{ id: number; data: Date }>
    >();
    for (const month of months) {
      const current = monthsByActivity.get(month.atividade_id) ?? [];
      current.push({ id: month.id, data: month.data });
      monthsByActivity.set(month.atividade_id, current);
    }

    const activitiesByPlan = new Map<
      number,
      Array<{
        id: number;
        descricao: string;
        meses: Array<{ id: number; data: Date }>;
      }>
    >();
    for (const activity of activities) {
      const current = activitiesByPlan.get(activity.plano_trabalho_id) ?? [];
      current.push({
        id: activity.id,
        descricao: activity.descricao,
        meses: monthsByActivity.get(activity.id) ?? [],
      });
      activitiesByPlan.set(activity.plano_trabalho_id, current);
    }

    return plans.map((plan) => ({
      ...plan,
      atividades: activitiesByPlan.get(plan.id) ?? [],
    }));
  }
}
