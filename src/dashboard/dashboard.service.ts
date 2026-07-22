import { Injectable } from '@nestjs/common';
import { SituacaoProjeto, StatusRelatorio } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardDeadlineDto,
  DashboardSummaryDto,
} from './dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(upcomingDays = 60): Promise<DashboardSummaryDto> {
    const today = this.startOfDay(new Date());
    const horizon = new Date(today);
    horizon.setUTCDate(horizon.getUTCDate() + upcomingDays);

    const [
      projetosAtivos,
      editaisEmAndamento,
      bolsistasVinculados,
      relatoriosPendentes,
      certificadosEmitidos,
      editais,
      cotas,
      relatorios,
      projetos,
    ] = await Promise.all([
      this.prisma.projeto_pesquisa.count({
        where: { situacao: SituacaoProjeto.EM_EXECUCAO },
      }),
      this.prisma.edital.count({
        where: {
          OR: [
            {
              periodo_submissoes: {
                inicio: { lte: today },
                fim: { gte: today },
              },
            },
            {
              periodo_execucao_rel: {
                inicio: { lte: today },
                fim: { gte: today },
              },
            },
          ],
        },
      }),
      this.prisma.membro_projeto.count({
        where: {
          ativo: true,
          funcao_projeto: { nome: 'Bolsista' },
        },
      }),
      this.prisma.relatorio.count({
        where: { status: StatusRelatorio.PENDENTE },
      }),
      this.prisma.certificado.count(),
      this.prisma.edital.findMany({
        select: {
          id: true,
          codigo: true,
          descricao: true,
          periodo_submissoes: { select: { fim: true } },
          periodo_execucao_rel: { select: { fim: true } },
        },
      }),
      this.prisma.cota_bolsa.findMany({
        select: {
          id: true,
          codigo: true,
          descricao: true,
          periodo_relatorio_parcial: { select: { fim: true } },
          periodo_relatorio_final: { select: { fim: true } },
          periodo_validade: { select: { fim: true } },
        },
      }),
      this.prisma.relatorio.findMany({
        where: {
          status: StatusRelatorio.PENDENTE,
          prazo_fim: { gte: today, lte: horizon },
        },
        select: {
          id: true,
          tipo: true,
          prazo_fim: true,
          projeto_pesquisa: { select: { titulo: true, codigo: true } },
        },
      }),
      this.prisma.projeto_pesquisa.findMany({
        where: {
          situacao: SituacaoProjeto.EM_EXECUCAO,
          data_fim: { gte: today, lte: horizon },
        },
        select: {
          id: true,
          codigo: true,
          titulo: true,
          data_fim: true,
        },
      }),
    ]);

    const deadlines: DashboardDeadlineDto[] = [];

    for (const edital of editais) {
      const label = edital.codigo ?? edital.descricao.slice(0, 60);
      this.pushDeadline(
        deadlines,
        today,
        horizon,
        edital.periodo_submissoes.fim,
        {
          type: 'EDITAL_SUBMISSAO',
          title: `Encerramento das submissões — ${label}`,
          entityId: edital.id,
          entityType: 'edital',
        },
      );
      this.pushDeadline(
        deadlines,
        today,
        horizon,
        edital.periodo_execucao_rel.fim,
        {
          type: 'EDITAL_EXECUCAO',
          title: `Encerramento da execução — ${label}`,
          entityId: edital.id,
          entityType: 'edital',
        },
      );
    }

    for (const cota of cotas) {
      const label = cota.codigo ?? cota.descricao.slice(0, 60);
      this.pushDeadline(
        deadlines,
        today,
        horizon,
        cota.periodo_relatorio_parcial.fim,
        {
          type: 'RELATORIO_PARCIAL',
          title: `Prazo relatórios parciais — ${label}`,
          entityId: cota.id,
          entityType: 'cota_bolsa',
        },
      );
      this.pushDeadline(
        deadlines,
        today,
        horizon,
        cota.periodo_relatorio_final.fim,
        {
          type: 'RELATORIO_FINAL',
          title: `Prazo relatórios finais — ${label}`,
          entityId: cota.id,
          entityType: 'cota_bolsa',
        },
      );
      this.pushDeadline(deadlines, today, horizon, cota.periodo_validade.fim, {
        type: 'COTA_VALIDADE',
        title: `Validade da cota — ${label}`,
        entityId: cota.id,
        entityType: 'cota_bolsa',
      });
    }

    for (const report of relatorios) {
      this.pushDeadline(deadlines, today, horizon, report.prazo_fim, {
        type: `RELATORIO_${report.tipo}`,
        title: `Relatório ${report.tipo.toLowerCase()} — ${report.projeto_pesquisa.titulo}`,
        entityId: report.id,
        entityType: 'relatorio',
      });
    }

    for (const projeto of projetos) {
      if (!projeto.data_fim) continue;
      this.pushDeadline(deadlines, today, horizon, projeto.data_fim, {
        type: 'PROJETO_FIM',
        title: `Fim do projeto — ${projeto.titulo}`,
        entityId: projeto.id,
        entityType: 'projeto_pesquisa',
      });
    }

    deadlines.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return {
      generatedAt: new Date().toISOString(),
      kpis: {
        projetosAtivos,
        editaisEmAndamento,
        bolsistasVinculados,
        relatoriosPendentes,
        certificadosEmitidos,
      },
      upcomingDeadlines: deadlines.slice(0, 10),
    };
  }

  private startOfDay(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private daysBetween(from: Date, to: Date): number {
    const ms = this.startOfDay(to).getTime() - this.startOfDay(from).getTime();
    return Math.round(ms / (24 * 60 * 60 * 1000));
  }

  private pushDeadline(
    list: DashboardDeadlineDto[],
    today: Date,
    horizon: Date,
    due: Date,
    meta: Omit<DashboardDeadlineDto, 'dueDate' | 'daysRemaining'>,
  ): void {
    const dueDay = this.startOfDay(due);
    if (dueDay < today || dueDay > horizon) return;

    list.push({
      ...meta,
      dueDate: this.toDateOnly(dueDay),
      daysRemaining: this.daysBetween(today, dueDay),
    });
  }
}
