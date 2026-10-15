import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import highsLoader, { Highs } from 'highs';
import { area_conhecimento, Prisma, SituacaoProjeto } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DistribuicaoParamsDto } from './dto/distribute.dto';
import { AtribuicaoDto, ConfirmDistribuicaoDto } from './dto/confirm-distribuicao.dto';
import {
  AtribuicaoPreviewDto,
  CandidatoDto,
  DistribuicaoConfirmResultDto,
  DistribuicaoPreviewDto,
} from './dto/distribuicao-response.dto';

// Peso aplicado ao score das áreas adicionais do consultor em relação à área principal
export const PESO_AREA_ADICIONAL = 0.5;

// Projetos que podem receber consultores: submetidos/validados ou já em distribuição
export const SITUACOES_DISTRIBUIVEIS: SituacaoProjeto[] = [
  SituacaoProjeto.SUBMETIDO,
  SituacaoProjeto.AGUARDANDO_VALIDACAO,
  SituacaoProjeto.VALIDADO,
  SituacaoProjeto.CADASTRADO,
  SituacaoProjeto.PUBLICADO,
  SituacaoProjeto.DISTRIBUIDO_PARA_AVALIACAO_AUTOMATICAMENTE,
  SituacaoProjeto.DISTRIBUICAO_PARA_AVALIACAO_MANUALMENTE,
  SituacaoProjeto.AGUARDANDO_AVALIACAO,
  SituacaoProjeto.AVALIACAO_INSUFICIENTE,
];

// Situações que passam para DISTRIBUIDO_PARA_AVALIACAO_AUTOMATICAMENTE ao confirmar
const SITUACOES_PRE_DISTRIBUICAO: SituacaoProjeto[] = [
  SituacaoProjeto.SUBMETIDO,
  SituacaoProjeto.AGUARDANDO_VALIDACAO,
  SituacaoProjeto.VALIDADO,
  SituacaoProjeto.CADASTRADO,
  SituacaoProjeto.PUBLICADO,
  SituacaoProjeto.DISTRIBUICAO_PARA_AVALIACAO_MANUALMENTE,
];

const SOLVER_STATUS_COM_SOLUCAO = new Set(['Optimal', 'Time limit reached']);

interface LpParams {
  alpha: number;
  beta: number;
  Lmin: number[];
  Lmax: number[];
  Dj: number[];
}

export interface ProjetoDistribuicao {
  id: number;
  avaliador_id: number | null;
  area_conhecimento: area_conhecimento | null;
  membro_usuario_ids: number[];
}

export interface ConsultorDistribuicao {
  id: number;
  usuario_id: number;
  nome: string;
  area_principal: area_conhecimento;
  areas_adicionais: area_conhecimento[];
}

interface AtribuicaoExistente {
  id: number;
  projeto_id: number;
  avaliador_id: number;
  consultor_id: number | null;
  bloqueada: boolean;
}

interface ContextoDistribuicao {
  projetos: ProjetoDistribuicao[];
  consultores: ConsultorDistribuicao[];
  existentes: AtribuicaoExistente[];
}

@Injectable()
export class DistribuicaoService {
  private highs: Highs | null = null;

  constructor(private prisma: PrismaService) {}

  private async initHighsModule(): Promise<Highs> {
    if (!this.highs) {
      this.highs = await highsLoader();
    }
    return this.highs;
  }

  protected scoreArea(pa: area_conhecimento, ca: area_conhecimento): number {
    let score = 0;
    if (pa.grande_area === ca.grande_area) score += 10;
    if (pa.area === ca.area) score += 50;
    if (pa.sub_area === ca.sub_area) score += 100;
    // if (pa.especialidade === ca.especialidade) score += 200;
    return score;
  }

  protected temConflito(projeto: ProjetoDistribuicao, consultor: ConsultorDistribuicao): boolean {
    return (
      projeto.avaliador_id === consultor.usuario_id ||
      projeto.membro_usuario_ids.includes(consultor.usuario_id)
    );
  }

  protected calcScore(
    projeto: ProjetoDistribuicao,
    consultor: ConsultorDistribuicao,
  ): number | null {
    if (this.temConflito(projeto, consultor)) return null;

    const pa = projeto.area_conhecimento;
    if (!pa) return 0;

    const principal = this.scoreArea(pa, consultor.area_principal);
    const adicional = Math.max(0, ...consultor.areas_adicionais.map(a => this.scoreArea(pa, a)));

    return Math.round(Math.max(principal, PESO_AREA_ADICIONAL * adicional));
  }

  protected calcScoreMatrix(
    projetos: ProjetoDistribuicao[],
    consultores: ConsultorDistribuicao[],
  ): Array<Array<number | null>> {
    return consultores.map(consultor =>
      projetos.map(projeto => this.calcScore(projeto, consultor)),
    );
  }

  /**
   * Monta o problema no formato CPLEX LP (o único aceito pelo HiGHS).
   * x_i_j: consultor i avalia projeto j; y_j: déficit de consultores no projeto j;
   * z_i: quanto falta para o consultor i atingir a carga mínima.
   */
  protected buildLpProblem(
    benefitMatrix: (number | null)[][],
    n: number,
    m: number,
    { alpha, beta, Lmin, Lmax, Dj }: LpParams,
  ): string {
    const eligible = (i: number, j: number) => benefitMatrix[i][j] !== null;

    const objTerms: string[] = [];
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++)
        if (eligible(i, j) && benefitMatrix[i][j]! > 0)
          objTerms.push(`+ ${benefitMatrix[i][j]} x_${i}_${j}`);
    for (let j = 0; j < n; j++) objTerms.push(`- ${alpha} y_${j}`);
    for (let i = 0; i < m; i++) objTerms.push(`- ${beta} z_${i}`);

    const constraints: string[] = [];

    // C1: sum_i(x_ij) + y_j = Dj  para cada projeto j
    for (let j = 0; j < n; j++) {
      const terms: string[] = [];
      for (let i = 0; i < m; i++) if (eligible(i, j)) terms.push(`x_${i}_${j}`);
      terms.push(`y_${j}`);
      constraints.push(`c1_${j}: ${terms.join(' + ')} = ${Dj[j]}`);
    }

    // C2: sum_j(x_ij) + z_i >= Lmin_i  e  sum_j(x_ij) <= Lmax_i  para cada consultor i
    for (let i = 0; i < m; i++) {
      const terms: string[] = [];
      for (let j = 0; j < n; j++) if (eligible(i, j)) terms.push(`x_${i}_${j}`);
      if (terms.length === 0) continue;
      const sum = terms.join(' + ');
      constraints.push(`c2min_${i}: ${sum} + z_${i} >= ${Lmin[i]}`);
      constraints.push(`c2max_${i}: ${sum} <= ${Lmax[i]}`);
    }

    const binVars: string[] = [];
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++) if (eligible(i, j)) binVars.push(`x_${i}_${j}`);

    // y e z são contínuas com limite inferior 0 (padrão do formato LP)
    return [
      'Maximize',
      ` obj: ${objTerms.join(' ').replace(/^\+ /, '')}`,
      'Subject To',
      ...constraints.map(c => ` ${c}`),
      ...(binVars.length ? ['Binary', ` ${binVars.join(' ')}`] : []),
      'End',
    ].join('\n');
  }

  /** Retorna os pares (consultor i, projeto j) com x_i_j = 1 na solução. */
  protected parseSolution(solution: {
    Columns: Record<string, object>;
  }): Array<{ i: number; j: number }> {
    const pairs: Array<{ i: number; j: number }> = [];

    for (const [name, col] of Object.entries(solution.Columns)) {
      const primal = 'Primal' in col ? Number(col.Primal) : 0;
      if (!name.startsWith('x_') || Math.round(primal) !== 1) continue;
      const [, i, j] = name.split('_').map(Number);
      pairs.push({ i, j });
    }

    return pairs;
  }

  protected async loadContexto(editalId: number): Promise<ContextoDistribuicao> {
    const edital = await this.prisma.edital.findUnique({
      where: { id: editalId },
      select: { id: true },
    });
    if (!edital) {
      throw new NotFoundException(`Edital Id ${editalId} não encontrado`);
    }

    const [projetos, vinculos, avaliacoes] = await Promise.all([
      this.prisma.projeto_pesquisa.findMany({
        where: { edital_id: editalId, situacao: { in: SITUACOES_DISTRIBUIVEIS } },
        select: {
          id: true,
          avaliador_id: true,
          area_conhecimento: true,
          projetoMembros: { select: { user_id: true } },
          membros: { where: { ativo: true }, select: { usuario_id: true } },
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.edital_consultor.findMany({
        where: { edital_id: editalId, consultor: { ativo: true } },
        select: {
          consultor: {
            select: {
              id: true,
              usuario_id: true,
              usuario: { select: { nome: true } },
              area_principal: true,
              areas_adicionais: { select: { area_conhecimento: true } },
            },
          },
        },
        orderBy: { consultor_id: 'asc' },
      }),
      this.prisma.projeto_avaliacao.findMany({
        where: {
          projeto_pesquisa: { edital_id: editalId, situacao: { in: SITUACOES_DISTRIBUIVEIS } },
        },
        select: {
          id: true,
          projeto_id: true,
          avaliador_id: true,
          consultor_id: true,
          _count: { select: { notas: true } },
          planos_avaliacao: { select: { _count: { select: { notas: true } } } },
        },
      }),
    ]);

    return {
      projetos: projetos.map(p => ({
        id: p.id,
        avaliador_id: p.avaliador_id,
        area_conhecimento: p.area_conhecimento,
        membro_usuario_ids: [
          ...p.projetoMembros.map(m => m.user_id),
          ...p.membros.map(m => m.usuario_id),
        ],
      })),
      consultores: vinculos.map(({ consultor: c }) => ({
        id: c.id,
        usuario_id: c.usuario_id,
        nome: c.usuario.nome,
        area_principal: c.area_principal,
        areas_adicionais: c.areas_adicionais.map(a => a.area_conhecimento),
      })),
      existentes: avaliacoes.map(a => ({
        id: a.id,
        projeto_id: a.projeto_id,
        avaliador_id: a.avaliador_id,
        consultor_id: a.consultor_id,
        bloqueada: a._count.notas > 0 || a.planos_avaliacao.some(pa => pa._count.notas > 0),
      })),
    };
  }

  /**
   * Calcula uma proposta de distribuição sem gravar nada.
   * Atribuições com notas lançadas são mantidas e só as vagas restantes são preenchidas.
   */
  async preview(editalId: number, params: DistribuicaoParamsDto): Promise<DistribuicaoPreviewDto> {
    if (params.minimoProjetosPorAvaliador > params.maximoProjetosPorAvaliador) {
      throw new BadRequestException(
        'O mínimo de projetos por consultor não pode ser maior que o máximo.',
      );
    }

    const { projetos, consultores, existentes } = await this.loadContexto(editalId);

    const consultorIdxPorUsuario = new Map(consultores.map((c, i) => [c.usuario_id, i]));
    const projetoIdx = new Map(projetos.map((p, j) => [p.id, j]));

    const benefitMatrix = this.calcScoreMatrix(projetos, consultores);
    const bloqueadasPorProjeto = new Array<number>(projetos.length).fill(0);
    const bloqueadasPorConsultor = new Array<number>(consultores.length).fill(0);
    const atribuicoes: AtribuicaoPreviewDto[] = [];

    for (const e of existentes.filter(e => e.bloqueada)) {
      const j = projetoIdx.get(e.projeto_id)!;
      const i = consultorIdxPorUsuario.get(e.avaliador_id);
      bloqueadasPorProjeto[j]++;

      let score = 0;
      if (i !== undefined) {
        bloqueadasPorConsultor[i]++;
        score = benefitMatrix[i][j] ?? 0;
        benefitMatrix[i][j] = null; // já atribuído, não pode ser escolhido de novo
      }

      atribuicoes.push({
        projeto_id: e.projeto_id,
        consultor_id: e.consultor_id ?? (i !== undefined ? consultores[i].id : null),
        avaliador_id: e.avaliador_id,
        score,
        bloqueada: true,
      });
    }

    const Dj = bloqueadasPorProjeto.map(qtd => Math.max(0, params.avaliadoresPorProjeto - qtd));
    const Lmax = bloqueadasPorConsultor.map(qtd =>
      Math.max(0, params.maximoProjetosPorAvaliador - qtd),
    );
    const Lmin = bloqueadasPorConsultor.map(qtd =>
      Math.max(0, params.minimoProjetosPorAvaliador - qtd),
    );

    let status = 'Empty';

    if (projetos.length > 0 && consultores.length > 0) {
      const highs = await this.initHighsModule();
      const lpProblem = this.buildLpProblem(benefitMatrix, projetos.length, consultores.length, {
        alpha: 10,
        beta: 10,
        Lmin,
        Lmax,
        Dj,
      });

      const solution = highs.solve(lpProblem, {
        presolve: 'on',
        log_to_console: false,
        output_flag: false,
        time_limit: 30,
        mip_heuristic_effort: 0.1,
      });

      status = solution.Status;
      if (!SOLVER_STATUS_COM_SOLUCAO.has(status)) {
        throw new Error(`Solver terminou com status inesperado: ${status}`);
      }

      for (const { i, j } of this.parseSolution(solution)) {
        const consultor = consultores[i];
        atribuicoes.push({
          projeto_id: projetos[j].id,
          consultor_id: consultor.id,
          avaliador_id: consultor.usuario_id,
          score: benefitMatrix[i][j] ?? 0,
          bloqueada: false,
        });
      }
    }

    const porProjeto = new Map<number, number>();
    const porUsuario = new Map<number, number>();
    for (const a of atribuicoes) {
      porProjeto.set(a.projeto_id, (porProjeto.get(a.projeto_id) ?? 0) + 1);
      porUsuario.set(a.avaliador_id, (porUsuario.get(a.avaliador_id) ?? 0) + 1);
    }

    return {
      status,
      atribuicoes,
      pendencias: projetos
        .map(p => ({
          projeto_id: p.id,
          faltando: Math.max(0, params.avaliadoresPorProjeto - (porProjeto.get(p.id) ?? 0)),
        }))
        .filter(p => p.faltando > 0),
      carga: consultores.map(c => ({
        consultor_id: c.id,
        total: porUsuario.get(c.usuario_id) ?? 0,
      })),
    };
  }

  /**
   * Grava o conjunto final de atribuições do edital (possivelmente ajustado manualmente).
   * Atribuições com notas são sempre preservadas; as demais são sincronizadas com o conjunto enviado.
   */
  async confirm(
    editalId: number,
    dto: ConfirmDistribuicaoDto,
  ): Promise<DistribuicaoConfirmResultDto> {
    const { projetos, consultores, existentes } = await this.loadContexto(editalId);
    const desejadas = this.validarAtribuicoes(dto.atribuicoes, projetos, consultores);

    // Chave por (projeto, usuário): cada usuário tem no máximo um consultor
    const chave = (projetoId: number, usuarioId: number) => `${projetoId}:${usuarioId}`;
    const consultorPorId = new Map(consultores.map(c => [c.id, c]));
    const existentesPorChave = new Map(
      existentes.map(e => [chave(e.projeto_id, e.avaliador_id), e]),
    );

    const desejadasPorChave = new Map(
      desejadas.map(d => {
        const consultor = consultorPorId.get(d.consultor_id)!;
        return [
          chave(d.projeto_id, consultor.usuario_id),
          { ...d, usuario_id: consultor.usuario_id },
        ];
      }),
    );

    const remover = existentes.filter(
      e => !e.bloqueada && !desejadasPorChave.has(chave(e.projeto_id, e.avaliador_id)),
    );
    const criar = [...desejadasPorChave.entries()]
      .filter(([k]) => !existentesPorChave.has(k))
      .map(([, d]) => d);
    const mantidas = existentes.filter(e => !remover.includes(e));
    const semConsultorId = mantidas.filter(e => e.consultor_id === null);

    await this.prisma.$transaction(async prisma => {
      if (remover.length) {
        await prisma.projeto_avaliacao.deleteMany({
          where: { id: { in: remover.map(e => e.id) } },
        });
      }

      // Atribuições antigas (anteriores aos consultores) ganham o vínculo com o consultor
      for (const e of semConsultorId) {
        const consultor = consultores.find(c => c.usuario_id === e.avaliador_id);
        if (consultor) {
          await prisma.projeto_avaliacao.update({
            where: { id: e.id },
            data: { consultor_id: consultor.id },
          });
        }
      }

      await this.criarAtribuicoes(prisma, criar);

      const projetosAtribuidos = [
        ...new Set([...mantidas.map(e => e.projeto_id), ...criar.map(c => c.projeto_id)]),
      ];
      if (projetosAtribuidos.length) {
        await prisma.projeto_pesquisa.updateMany({
          where: { id: { in: projetosAtribuidos }, situacao: { in: SITUACOES_PRE_DISTRIBUICAO } },
          data: { situacao: SituacaoProjeto.DISTRIBUIDO_PARA_AVALIACAO_AUTOMATICAMENTE },
        });
      }
    });

    return { criadas: criar.length, removidas: remover.length, mantidas: mantidas.length };
  }

  private validarAtribuicoes(
    atribuicoes: AtribuicaoDto[],
    projetos: ProjetoDistribuicao[],
    consultores: ConsultorDistribuicao[],
  ): AtribuicaoDto[] {
    const projetoPorId = new Map(projetos.map(p => [p.id, p]));
    const consultorPorId = new Map(consultores.map(c => [c.id, c]));
    const vistas = new Set<string>();
    const erros: string[] = [];

    for (const { projeto_id, consultor_id } of atribuicoes) {
      const projeto = projetoPorId.get(projeto_id);
      const consultor = consultorPorId.get(consultor_id);

      if (!projeto) {
        erros.push(`Projeto ${projeto_id} não pertence ao edital ou não está apto à distribuição.`);
        continue;
      }
      if (!consultor) {
        erros.push(`Consultor ${consultor_id} não está vinculado ao edital ou está inativo.`);
        continue;
      }
      if (this.temConflito(projeto, consultor)) {
        erros.push(
          `Consultor ${consultor_id} tem conflito de interesse com o projeto ${projeto_id}.`,
        );
        continue;
      }

      const k = `${projeto_id}:${consultor_id}`;
      if (vistas.has(k)) {
        erros.push(`Atribuição duplicada: projeto ${projeto_id}, consultor ${consultor_id}.`);
      }
      vistas.add(k);
    }

    if (erros.length) {
      throw new BadRequestException(erros);
    }

    return atribuicoes;
  }

  private async criarAtribuicoes(
    prisma: Prisma.TransactionClient,
    atribuicoes: Array<{ projeto_id: number; consultor_id: number; usuario_id: number }>,
  ): Promise<void> {
    if (!atribuicoes.length) return;

    const planos = await prisma.plano_trabalho.findMany({
      where: { pesquisa_id: { in: [...new Set(atribuicoes.map(a => a.projeto_id))] } },
      select: { id: true, pesquisa_id: true },
    });

    const planosPorProjeto = new Map<number, number[]>();
    for (const { pesquisa_id, id } of planos) {
      const ids = planosPorProjeto.get(pesquisa_id) ?? [];
      ids.push(id);
      planosPorProjeto.set(pesquisa_id, ids);
    }

    for (const { projeto_id, consultor_id, usuario_id } of atribuicoes) {
      await prisma.projeto_avaliacao.create({
        data: {
          projeto_id,
          avaliador_id: usuario_id,
          consultor_id,
          planos_avaliacao: {
            create: (planosPorProjeto.get(projeto_id) ?? []).map(plano_trabalho_id => ({
              plano_trabalho_id,
            })),
          },
        },
      });
    }
  }

  /** Consultores do edital aptos a avaliar o projeto, para ajuste manual da distribuição. */
  async candidatos(editalId: number, projetoId: number): Promise<CandidatoDto[]> {
    const { projetos, consultores, existentes } = await this.loadContexto(editalId);

    const projeto = projetos.find(p => p.id === projetoId);
    if (!projeto) {
      throw new NotFoundException(
        `Projeto Id ${projetoId} não pertence ao edital ou não está apto à distribuição`,
      );
    }

    const cargaPorUsuario = new Map<number, number>();
    for (const e of existentes) {
      cargaPorUsuario.set(e.avaliador_id, (cargaPorUsuario.get(e.avaliador_id) ?? 0) + 1);
    }
    const atribuidos = new Set(
      existentes.filter(e => e.projeto_id === projetoId).map(e => e.avaliador_id),
    );

    return consultores
      .map(c => ({ consultor: c, score: this.calcScore(projeto, c) }))
      .filter((r): r is { consultor: ConsultorDistribuicao; score: number } => r.score !== null)
      .map(({ consultor, score }) => ({
        consultor_id: consultor.id,
        nome: consultor.nome,
        score,
        carga: cargaPorUsuario.get(consultor.usuario_id) ?? 0,
        atribuido: atribuidos.has(consultor.usuario_id),
      }))
      .sort((a, b) => b.score - a.score || a.carga - b.carga);
  }
}
