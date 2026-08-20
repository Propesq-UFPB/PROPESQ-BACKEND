import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { area_conhecimento } from '@prisma/client';
import { DistribuicaoParamsDto } from './dto/distribute.dto';

const requireFunc = require;

interface HighsModule {
  solve: (
    modelStr: string,
    options?: Record<string, any>,
  ) => {
    Status: string;
    Columns: Record<string, { Primal: number }>;
    Rows: any[];
    ObjectiveValue: number;
  };
}

interface LpParams {
  alpha: number;
  beta: number;
  Lmin: number;
  Lmax: number;
  Dj: number;
}

@Injectable()
export class DistribuicaoService {
  private highs: HighsModule | null = null;

  constructor(private prisma: PrismaService) {}

  private async initHighsModule(): Promise<HighsModule> {
    if (this.highs) {
      return this.highs;
    }

    try {
      const higgsPath = path.join(__dirname, 'highs-js', 'highs.js');
      const Module = requireFunc(higgsPath) as Promise<HighsModule>;
      this.highs = await Module;

      if (!this.highs) {
        throw new Error('Falha ao inicializar o módulo HiGHS');
      }

      return this.highs;
    } catch (error) {
      console.error('Falha ao inicializar o módulo HiGHS:', error);
      throw new Error(`Falha ao inicializar o módulo HiGHS: ${error}`);
    }
  }

  async hasDistribuicao(editalId: number): Promise<boolean> {
    return (
      (await this.prisma.projeto_avaliacao.findFirst({
        where: {
          projeto_pesquisa: {
            edital_id: editalId,
          },
        },
      })) !== null
    );
  }

  async redistribute(editalId: number, params: DistribuicaoParamsDto) {
    await this.prisma.projeto_avaliacao.deleteMany({
      where: {
        projeto_pesquisa: {
          edital_id: editalId,
        },
      },
    });

    return this.distribute(editalId, params);
  }

  protected calcScoreMatrix(
    projetos: Array<{ area_conhecimento: area_conhecimento | null; avaliador_id: number | null }>,
    docentes: Array<{ area_conhecimento: area_conhecimento | null; usuario_id: number }>,
  ): Array<Array<number | null>> {
    return docentes.map(docente =>
      projetos.map(projeto => {
        if (projeto.avaliador_id === docente.usuario_id) return null;

        const pa = projeto.area_conhecimento;
        const da = docente.area_conhecimento;

        if (!pa || !da) return 0;

        let score = 0;
        if (pa.grande_area === da.grande_area) score += 10;
        if (pa.area === da.area) score += 50;
        if (pa.sub_area === da.sub_area) score += 100;
        // if (pa.especialidade === da.especialidade) score += 200;

        return score;
      }),
    );
  }

  protected buildLpProblem(
    benefitMatrix: (number | null)[][],
    n: number,
    m: number,
    { alpha, beta, Lmin, Lmax, Dj }: LpParams,
  ): string {
    const eligible = (i: number, j: number) => benefitMatrix[i][j] !== null;

    // Objective: only include pairs with positive score
    const objTerms: string[] = [];
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++)
        if (eligible(i, j) && benefitMatrix[i][j]! > 0)
          objTerms.push(`${benefitMatrix[i][j]} x_${i}_${j}`);
    for (let j = 0; j < n; j++) objTerms.push(`-${alpha} y_${j}`);
    for (let i = 0; i < m; i++) objTerms.push(`-${beta} z_${i}`);
    const objFunction = `max: ${objTerms.join(' + ').replace(/\+ -/g, '- ')}`;

    // C1: sum_i(x_ij) + y_j = Dj  for each project j
    // y_j is the deficit (number of missing evaluators), penalized in objective
    const constraint_1 = Array.from({ length: n }, (_, j) => {
      const terms: string[] = [];
      for (let i = 0; i < m; i++) if (eligible(i, j)) terms.push(`x_${i}_${j}`);
      terms.push(`y_${j}`);
      return `${terms.join(' + ')} = ${Dj}`;
    });

    // C2: sum_j(x_ij) + z_i >= Lmin  and  sum_j(x_ij) <= Lmax
    // z_i is the load slack (how short of Lmin the docente is), penalized in objective
    const constraint_2: string[] = [];
    for (let i = 0; i < m; i++) {
      const terms: string[] = [];
      for (let j = 0; j < n; j++) if (eligible(i, j)) terms.push(`x_${i}_${j}`);
      const sum = terms.join(' + ');
      constraint_2.push(`${sum} + z_${i} >= ${Lmin}`);
      constraint_2.push(`${sum} <= ${Lmax}`);
    }

    // Binary variables — all eligible pairs
    const binVars: string[] = [];
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++) if (eligible(i, j)) binVars.push(`x_${i}_${j}`);

    // Non-negative bounds for continuous slack variables y and z
    const bounds: string[] = [
      ...Array.from({ length: n }, (_, j) => `y_${j} >= 0`),
      ...Array.from({ length: m }, (_, i) => `z_${i} >= 0`),
    ];

    return [
      `${objFunction};`,
      constraint_1.map(c => `${c};`).join('\n'),
      constraint_2.map(c => `${c};`).join('\n'),
      bounds.map(b => `${b};`).join('\n'),
      `bin ${binVars.join(', ')};`,
    ].join('\n');
  }

  protected parseSolution(
    solution: { Columns: Record<string, { Primal: number }> },
    projetosPesquisa: Array<{ id: number }>,
    docentes: Array<{ usuario_id: number }>,
  ): Array<{ projeto_id: number; avaliador_ids: number[] }> {
    const map = new Map<number, number[]>();

    for (const [name, col] of Object.entries(solution.Columns)) {
      if (!name.startsWith('x_') || Math.round(col.Primal) !== 1) continue;

      const [, i, j] = name.split('_').map(Number);
      const docente = docentes[i];
      const projeto = projetosPesquisa[j];

      if (!docente || !projeto) continue;

      const existing = map.get(projeto.id) ?? [];
      existing.push(docente.usuario_id);
      map.set(projeto.id, existing);
    }

    return Array.from(map.entries()).map(([projeto_id, avaliador_ids]) => ({
      projeto_id,
      avaliador_ids,
    }));
  }

  protected async saveSolution(
    pairs: Array<{ projeto_id: number; avaliador_ids: number[] }>,
  ): Promise<void> {
    const projeto_ids = pairs.map(p => p.projeto_id);

    await this.prisma.$transaction(async prisma => {
      await prisma.projeto_avaliacao.deleteMany({
        where: { projeto_id: { in: projeto_ids } },
      });

      const planos_trabalho = await prisma.plano_trabalho.findMany({
        where: { pesquisa_id: { in: projeto_ids } },
        select: { id: true, pesquisa_id: true },
      });

      const planos_trabalho_by_projeto = new Map<number, number[]>();
      for (const { pesquisa_id, id } of planos_trabalho) {
        const ids = planos_trabalho_by_projeto.get(pesquisa_id) ?? [];
        ids.push(id);
        planos_trabalho_by_projeto.set(pesquisa_id, ids);
      }

      for (const { projeto_id, avaliador_ids } of pairs) {
        const plano_trabalho_ids = planos_trabalho_by_projeto.get(projeto_id) ?? [];

        for (const avaliador_id of avaliador_ids) {
          await prisma.projeto_avaliacao.create({
            data: {
              projeto_id,
              avaliador_id,
              planos_avaliacao: {
                create: plano_trabalho_ids.map(plano_trabalho_id => ({
                  plano_trabalho_id,
                })),
              },
            },
          });
        }
      }
    });
  }

  async distribute(editalId: number, params: DistribuicaoParamsDto) {
    try {
      const highs = await this.initHighsModule();

      const projetosPesquisa = await this.prisma.projeto_pesquisa.findMany({
        where: { edital_id: editalId },
        include: { area_conhecimento: true },
      });

      const avaliadorIds = new Set(
        projetosPesquisa.map(p => p.avaliador_id).filter(id => id !== null),
      );

      const docentes = await this.prisma.docente.findMany({
        where: {
          usuario_id: { in: Array.from(avaliadorIds) },
        },
        include: { area_conhecimento: true },
      });

      const n = projetosPesquisa.length;
      const m = docentes.length;
      const benefitMatrix = this.calcScoreMatrix(projetosPesquisa, docentes);

      const lpParams: LpParams = {
        alpha: 10,
        beta: 10,
        Lmin: params.minimoProjetosPorAvaliador,
        Lmax: params.maximoProjetosPorAvaliador,
        Dj: params.avaliadoresPorProjeto,
      };
      const lpProblem = this.buildLpProblem(benefitMatrix, n, m, lpParams);

      const solverOptions = {
        presolve: 'on',
        run_crossover: 'off',
        log_to_console: false,
        output_flag: false,
        time_limit: 30,
        mip_heuristic_effort: 0.1,
      };

      const solution = highs.solve(lpProblem, solverOptions);

      if (solution.Status !== 'Optimal') {
        throw new Error(`Solver terminou com status inesperado: ${solution.Status}`);
      }

      const project_docentes = this.parseSolution(solution, projetosPesquisa, docentes);

      return this.saveSolution(project_docentes);
    } catch (error) {
      console.error('Erro ao resolver problema de otimização:', error);
      throw error;
    }
  }
}
