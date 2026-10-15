import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import highsLoader, { Highs } from 'highs';
import {
  area_conhecimento,
  Prisma,
  SituacaoProjeto,
  StatusAtribuicao,
  TipoMembroProjeto,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DistribuicaoParamsDto } from './dto/distribute.dto';
import { AtribuicaoDto, ConfirmDistribuicaoDto } from './dto/confirm-distribuicao.dto';
import {
  AtribuicaoPreviewDto,
  AtribuicaoRespostaDto,
  CandidatoDto,
  DistribuicaoConfirmResultDto,
  DistribuicaoPanoramaDto,
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
  status: StatusAtribuicao;
  tem_notas: boolean;
}

// Recusadas ficam como histórico: não ocupam vaga e não são removidas
const ativa = (a: AtribuicaoExistente) => a.status !== StatusAtribuicao.RECUSADO;
const chave = (projetoId: number, usuarioId: number) => `${projetoId}:${usuarioId}`;

const temNotasSelect = {
  _count: { select: { notas: true } },
  planos_avaliacao: { select: { _count: { select: { notas: true } } } },
} satisfies Prisma.projeto_avaliacaoSelect;

function temNotas(a: Prisma.projeto_avaliacaoGetPayload<{ select: typeof temNotasSelect }>) {
  return a._count.notas > 0 || a.planos_avaliacao.some(pa => pa._count.notas > 0);
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

  /**
   * area_conhecimento é hierárquica: níveis mais específicos ficam vazios em registros de
   * nível superior. Um nível só pontua se não for vazio e se os níveis acima também coincidirem.
   */
  protected scoreArea(pa: area_conhecimento, ca: area_conhecimento): number {
    const niveis: Array<[keyof area_conhecimento, number]> = [
      ['grande_area', 10],
      ['area', 50],
      ['sub_area', 100],
      // ['especialidade', 200],
    ];

    let score = 0;
    for (const [campo, pontos] of niveis) {
      if (!pa[campo] || pa[campo] !== ca[campo]) break;
      score += pontos;
    }
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
          status: true,
          ...temNotasSelect,
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
        status: a.status,
        tem_notas: temNotas(a),
      })),
    };
  }

  /**
   * Calcula uma proposta de distribuição sem gravar nada.
   * Convites pendentes e aceitos são mantidos e só as vagas abertas (inclusive as liberadas
   * por recusas) são preenchidas. Quem recusou um projeto não é sugerido de novo para ele.
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
    const mantidasPorProjeto = new Array<number>(projetos.length).fill(0);
    const mantidasPorConsultor = new Array<number>(consultores.length).fill(0);
    const atribuicoes: AtribuicaoPreviewDto[] = [];

    for (const e of existentes) {
      const j = projetoIdx.get(e.projeto_id)!;
      const i = consultorIdxPorUsuario.get(e.avaliador_id);
      const score = i !== undefined ? (benefitMatrix[i][j] ?? 0) : 0;

      // Já atribuído ou recusado: o par não pode ser escolhido de novo
      if (i !== undefined) benefitMatrix[i][j] = null;
      if (!ativa(e)) continue;

      mantidasPorProjeto[j]++;
      if (i !== undefined) mantidasPorConsultor[i]++;

      atribuicoes.push({
        projeto_id: e.projeto_id,
        consultor_id: e.consultor_id ?? (i !== undefined ? consultores[i].id : null),
        avaliador_id: e.avaliador_id,
        score,
        existente: true,
        atribuicao_id: e.id,
        status: e.status,
        tem_notas: e.tem_notas,
      });
    }

    const Dj = mantidasPorProjeto.map(qtd => Math.max(0, params.avaliadoresPorProjeto - qtd));
    const Lmax = mantidasPorConsultor.map(qtd =>
      Math.max(0, params.maximoProjetosPorAvaliador - qtd),
    );
    const Lmin = mantidasPorConsultor.map(qtd =>
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
          existente: false,
          atribuicao_id: null,
          status: null,
          tem_notas: false,
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
   * Novas atribuições nascem como convites pendentes. Atribuições ativas sem notas que não
   * forem enviadas são removidas; as com notas e as recusadas (histórico) são preservadas.
   */
  async confirm(
    editalId: number,
    dto: ConfirmDistribuicaoDto,
  ): Promise<DistribuicaoConfirmResultDto> {
    const { projetos, consultores, existentes } = await this.loadContexto(editalId);
    const recusas = new Set(
      existentes.filter(e => !ativa(e)).map(e => chave(e.projeto_id, e.avaliador_id)),
    );
    const desejadas = this.validarAtribuicoes(dto.atribuicoes, projetos, consultores, recusas);

    // Chave por (projeto, usuário): cada usuário tem no máximo um consultor
    const consultorPorId = new Map(consultores.map(c => [c.id, c]));
    const ativas = existentes.filter(ativa);
    const ativasPorChave = new Map(ativas.map(e => [chave(e.projeto_id, e.avaliador_id), e]));

    const desejadasPorChave = new Map(
      desejadas.map(d => {
        const consultor = consultorPorId.get(d.consultor_id)!;
        return [
          chave(d.projeto_id, consultor.usuario_id),
          { ...d, usuario_id: consultor.usuario_id },
        ];
      }),
    );

    const remover = ativas.filter(
      e => !e.tem_notas && !desejadasPorChave.has(chave(e.projeto_id, e.avaliador_id)),
    );
    const criar = [...desejadasPorChave.entries()]
      .filter(([k]) => !ativasPorChave.has(k))
      .map(([, d]) => d);
    const mantidas = ativas.filter(e => !remover.includes(e));
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
    recusas: Set<string>,
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
      if (recusas.has(chave(projeto_id, consultor.usuario_id))) {
        erros.push(`Consultor ${consultor_id} recusou o convite para o projeto ${projeto_id}.`);
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

    const ativas = existentes.filter(ativa);
    const cargaPorUsuario = new Map<number, number>();
    for (const e of ativas) {
      cargaPorUsuario.set(e.avaliador_id, (cargaPorUsuario.get(e.avaliador_id) ?? 0) + 1);
    }
    const doProjeto = existentes.filter(e => e.projeto_id === projetoId);
    const atribuidos = new Set(doProjeto.filter(ativa).map(e => e.avaliador_id));
    const recusaram = new Set(doProjeto.filter(e => !ativa(e)).map(e => e.avaliador_id));

    return consultores
      .filter(c => !recusaram.has(c.usuario_id))
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

  /** Projetos aptos à distribuição e atribuições do edital, para a tela de distribuição. */
  async panorama(editalId: number): Promise<DistribuicaoPanoramaDto> {
    const edital = await this.prisma.edital.findUnique({
      where: { id: editalId },
      select: { id: true },
    });
    if (!edital) {
      throw new NotFoundException(`Edital Id ${editalId} não encontrado`);
    }

    const filtroProjetos = { edital_id: editalId, situacao: { in: SITUACOES_DISTRIBUIVEIS } };

    const [projetos, atribuicoes] = await Promise.all([
      this.prisma.projeto_pesquisa.findMany({
        where: filtroProjetos,
        select: {
          id: true,
          codigo: true,
          titulo: true,
          situacao: true,
          area_conhecimento: true,
          unidade_academica: { select: { sigla: true } },
          projetoMembros: {
            where: { funcao: TipoMembroProjeto.COORDENADOR },
            select: { user: { select: { nome: true } } },
            take: 1,
          },
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.projeto_avaliacao.findMany({
        where: { projeto_pesquisa: filtroProjetos },
        select: {
          id: true,
          projeto_id: true,
          consultor_id: true,
          avaliador_id: true,
          avaliador: { select: { nome: true } },
          status: true,
          motivo_recusa: true,
          criado_em: true,
          respondido_em: true,
          ...temNotasSelect,
        },
        orderBy: { id: 'asc' },
      }),
    ]);

    return {
      projetos: projetos.map(p => ({
        id: p.id,
        codigo: p.codigo,
        titulo: p.titulo,
        situacao: p.situacao,
        coordenador: p.projetoMembros[0]?.user.nome ?? null,
        unidade: p.unidade_academica?.sigla ?? null,
        area_conhecimento: p.area_conhecimento,
      })),
      atribuicoes: atribuicoes.map(a => ({
        id: a.id,
        projeto_id: a.projeto_id,
        consultor_id: a.consultor_id,
        avaliador_id: a.avaliador_id,
        avaliador_nome: a.avaliador.nome,
        status: a.status,
        motivo_recusa: a.motivo_recusa,
        tem_notas: temNotas(a),
        criado_em: a.criado_em,
        respondido_em: a.respondido_em,
      })),
    };
  }

  /** Resposta do próprio avaliador ao convite de avaliação. */
  async responder(
    atribuicaoId: number,
    usuarioId: number,
    aceitar: boolean,
    motivo?: string,
  ): Promise<AtribuicaoRespostaDto> {
    const atribuicao = await this.prisma.projeto_avaliacao.findUnique({
      where: { id: atribuicaoId },
      select: { avaliador_id: true, status: true },
    });

    if (!atribuicao) {
      throw new NotFoundException('Atribuição de avaliação não encontrada');
    }
    if (atribuicao.avaliador_id !== usuarioId) {
      throw new ForbiddenException('Apenas o avaliador convidado pode responder a este convite');
    }
    if (atribuicao.status !== StatusAtribuicao.PENDENTE) {
      throw new BadRequestException(
        `Este convite já foi ${atribuicao.status === StatusAtribuicao.ACEITO ? 'aceito' : 'recusado'}`,
      );
    }

    return this.prisma.projeto_avaliacao.update({
      where: { id: atribuicaoId },
      data: {
        status: aceitar ? StatusAtribuicao.ACEITO : StatusAtribuicao.RECUSADO,
        motivo_recusa: aceitar ? null : motivo,
        respondido_em: new Date(),
      },
      select: { id: true, status: true, motivo_recusa: true, respondido_em: true },
    });
  }
}
