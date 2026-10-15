import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import highsLoader from 'highs';
import { area_conhecimento, SituacaoProjeto, StatusAtribuicao } from '@prisma/client';
import {
  ConsultorDistribuicao,
  DistribuicaoService,
  ProjetoDistribuicao,
} from './distribuicao.service';
import { PrismaService } from '../prisma/prisma.service';
import { DistribuicaoParamsDto } from './dto/distribute.dto';

const txMock = {
  projeto_avaliacao: {
    deleteMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  plano_trabalho: { findMany: jest.fn() },
  projeto_pesquisa: { updateMany: jest.fn() },
};

const prismaMock = {
  edital: { findUnique: jest.fn() },
  projeto_pesquisa: { findMany: jest.fn(), findUnique: jest.fn() },
  edital_consultor: { findMany: jest.fn() },
  projeto_avaliacao: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  consultor: { findUnique: jest.fn() },
  $transaction: jest.fn(),
};

class TestableDistribuicaoService extends DistribuicaoService {
  public calcScoreMatrix(projetos: ProjetoDistribuicao[], consultores: ConsultorDistribuicao[]) {
    return super.calcScoreMatrix(projetos, consultores);
  }

  public buildLpProblem(...args: Parameters<DistribuicaoService['buildLpProblem']>) {
    return super.buildLpProblem(...args);
  }

  public parseSolution(solution: { Columns: Record<string, object> }) {
    return super.parseSolution(solution);
  }
}

const area = (overrides: Partial<area_conhecimento> = {}): area_conhecimento => ({
  id: 1,
  grande_area: 'Ciências Exatas',
  area: 'Computação',
  sub_area: 'IA',
  especialidade: 'ML',
  ...overrides,
});

const outraArea = area({
  id: 2,
  grande_area: 'Ciências Biológicas',
  area: 'Genética',
  sub_area: 'Genômica',
  especialidade: 'X',
});

const projeto = (overrides: Partial<ProjetoDistribuicao> = {}): ProjetoDistribuicao => ({
  id: 1,
  avaliador_id: null,
  area_conhecimento: area(),
  membro_usuario_ids: [],
  ...overrides,
});

const consultor = (overrides: Partial<ConsultorDistribuicao> = {}): ConsultorDistribuicao => ({
  id: 1,
  usuario_id: 100,
  nome: 'Consultor',
  area_principal: area(),
  areas_adicionais: [],
  ...overrides,
});

// Formato retornado pelo prisma em loadContexto
const projetoRow = (id: number, a: area_conhecimento | null, membros: number[] = []) => ({
  id,
  avaliador_id: null,
  area_conhecimento: a,
  projetoMembros: membros.map(user_id => ({ user_id })),
  membros: [],
});

const consultorRow = (
  id: number,
  usuario_id: number,
  principal: area_conhecimento,
  adicionais: area_conhecimento[] = [],
) => ({
  consultor: {
    id,
    usuario_id,
    usuario: { nome: `Consultor ${id}` },
    area_principal: principal,
    areas_adicionais: adicionais.map(area_conhecimento => ({ area_conhecimento })),
  },
});

const avaliacaoRow = (
  id: number,
  projeto_id: number,
  avaliador_id: number,
  consultor_id: number | null,
  {
    status = StatusAtribuicao.PENDENTE,
    comNotas = false,
  }: { status?: StatusAtribuicao; comNotas?: boolean } = {},
) => ({
  id,
  projeto_id,
  avaliador_id,
  consultor_id,
  status,
  _count: { notas: comNotas ? 1 : 0 },
  planos_avaliacao: [],
});

const sugestao = { existente: false, atribuicao_id: null, status: null, tem_notas: false };
const ACEITO_COM_NOTAS = { status: StatusAtribuicao.ACEITO, comNotas: true };
const RECUSADO = { status: StatusAtribuicao.RECUSADO };

describe('DistribuicaoService', () => {
  let service: TestableDistribuicaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: DistribuicaoService, useClass: TestableDistribuicaoService },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TestableDistribuicaoService>(DistribuicaoService);

    prismaMock.edital.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.projeto_pesquisa.findMany.mockResolvedValue([]);
    prismaMock.edital_consultor.findMany.mockResolvedValue([]);
    prismaMock.projeto_avaliacao.findMany.mockResolvedValue([]);
    prismaMock.$transaction.mockImplementation((fn: (tx: typeof txMock) => unknown) => fn(txMock));
    txMock.plano_trabalho.findMany.mockResolvedValue([]);
  });

  afterEach(() => jest.clearAllMocks());

  it('loads the packaged runtime and reuses the initialized solver', async () => {
    const highs = await service['initHighsModule']();
    expect(typeof highs.solve).toBe('function');
    expect(await service['initHighsModule']()).toBe(highs);
  });

  // --- calcScoreMatrix ---
  describe('calcScoreMatrix', () => {
    it('scores full match on the main area', () => {
      const matrix = service.calcScoreMatrix([projeto()], [consultor()]);
      expect(matrix[0][0]).toBe(160); // 10 + 50 + 100 (especialidade desativada)
    });

    it('scores partial matches on the main area', () => {
      const matrix = service.calcScoreMatrix(
        [projeto()],
        [
          consultor({ area_principal: area({ sub_area: 'other' }) }),
          consultor({ area_principal: area({ area: 'other', sub_area: 'other' }) }),
          consultor({ area_principal: outraArea }),
        ],
      );
      expect(matrix.map(row => row[0])).toEqual([60, 10, 0]);
    });

    it('weights additional areas by half', () => {
      const matrix = service.calcScoreMatrix(
        [projeto()],
        [consultor({ area_principal: outraArea, areas_adicionais: [area()] })],
      );
      expect(matrix[0][0]).toBe(80);
    });

    it('uses the best between main and weighted additional areas', () => {
      const matrix = service.calcScoreMatrix(
        [projeto()],
        [
          // principal 60 vs adicional 0.5 * 160 = 80
          consultor({ area_principal: area({ sub_area: 'other' }), areas_adicionais: [area()] }),
          // principal 160 vs adicional 0.5 * 160 = 80
          consultor({ area_principal: area(), areas_adicionais: [area()] }),
          // principal 0 vs melhor adicional 0.5 * 60 = 30
          consultor({
            area_principal: outraArea,
            areas_adicionais: [
              area({ area: 'other', sub_area: 'other' }),
              area({ sub_area: 'other' }),
            ],
          }),
        ],
      );
      expect(matrix.map(row => row[0])).toEqual([80, 160, 30]);
    });

    it('does not score empty levels of hierarchical areas as matches', () => {
      const grandeArea = area({ area: '', sub_area: '', especialidade: '' });
      const matrix = service.calcScoreMatrix(
        [projeto({ area_conhecimento: grandeArea }), projeto({ area_conhecimento: area() })],
        [consultor({ area_principal: grandeArea })],
      );
      expect(matrix[0]).toEqual([10, 10]);
    });

    it('only scores a level when the levels above it also match', () => {
      const matrix = service.calcScoreMatrix(
        [projeto()],
        [consultor({ area_principal: area({ grande_area: 'other' }) })],
      );
      expect(matrix[0][0]).toBe(0);
    });

    it('returns 0 when projeto has no area_conhecimento', () => {
      const matrix = service.calcScoreMatrix([projeto({ area_conhecimento: null })], [consultor()]);
      expect(matrix[0][0]).toBe(0);
    });

    it('returns null when consultor is a member of the projeto', () => {
      const matrix = service.calcScoreMatrix(
        [projeto({ membro_usuario_ids: [100] })],
        [consultor({ usuario_id: 100 })],
      );
      expect(matrix[0][0]).toBeNull();
    });

    it('returns null when consultor is the projeto avaliador_id', () => {
      const matrix = service.calcScoreMatrix(
        [projeto({ avaliador_id: 100 })],
        [consultor({ usuario_id: 100 })],
      );
      expect(matrix[0][0]).toBeNull();
    });

    it('builds an m x n matrix (consultores x projetos)', () => {
      const matrix = service.calcScoreMatrix(
        [projeto({ id: 1 }), projeto({ id: 2 }), projeto({ id: 3 })],
        [consultor({ id: 1 }), consultor({ id: 2 })],
      );
      expect(matrix).toHaveLength(2);
      expect(matrix[0]).toHaveLength(3);
    });
  });

  // --- buildLpProblem ---
  describe('buildLpProblem', () => {
    const params = { alpha: 10, beta: 10, Lmin: [1, 1], Lmax: [2, 2], Dj: [1, 1] };

    it('solves the generated allocation model with the real solver', async () => {
      const highs = await service['initHighsModule']();
      const lp = service.buildLpProblem(
        [
          [null, 100],
          [200, null],
        ],
        2,
        2,
        params,
      );
      const solution = highs.solve(lp, { output_flag: false });
      expect(solution.Status).toBe('Optimal');
      expect(solution.ObjectiveValue).toBe(300);
      expect(solution.Columns.x_0_1.Primal).toBe(1);
      expect(solution.Columns.x_1_0.Primal).toBe(1);
    });

    it('uses the deficit variable when no consultor is eligible', async () => {
      const highs = await service['initHighsModule']();
      const lp = service.buildLpProblem([[null]], 1, 1, params);
      const solution = highs.solve(lp, { output_flag: false });
      expect(solution.Status).toBe('Optimal');
      expect(solution.Columns.y_0.Primal).toBe(1);
    });

    it('generates a CPLEX LP model', () => {
      const lp = service.buildLpProblem(
        [
          [160, 0],
          [0, 60],
        ],
        2,
        2,
        params,
      );
      expect(lp).toMatch(/^Maximize\n obj: 160 x_0_0 \+ 60 x_1_1 - 10 y_0/);
      expect(lp).toContain('Subject To');
      expect(lp).toContain('Binary');
      expect(lp.endsWith('End')).toBe(true);
    });

    it('excludes ineligible (null) pairs', () => {
      const lp = service.buildLpProblem(
        [
          [null, 100],
          [200, null],
        ],
        2,
        2,
        params,
      );
      expect(lp).not.toContain('x_0_0');
      expect(lp).not.toContain('x_1_1');
      expect(lp).toContain('x_0_1');
      expect(lp).toContain('x_1_0');
    });

    it('uses per-project demand and per-consultor load bounds', () => {
      const lp = service.buildLpProblem([[100, 100]], 2, 1, {
        alpha: 10,
        beta: 10,
        Lmin: [1],
        Lmax: [3],
        Dj: [2, 0],
      });
      expect(lp).toContain('c1_0: x_0_0 + y_0 = 2');
      expect(lp).toContain('c1_1: x_0_1 + y_1 = 0');
      expect(lp).toContain('c2min_0: x_0_0 + x_0_1 + z_0 >= 1');
      expect(lp).toContain('c2max_0: x_0_0 + x_0_1 <= 3');
    });

    it('is accepted and solved by HiGHS', async () => {
      const highs = await highsLoader();
      const lp = service.buildLpProblem(
        [
          [160, 10],
          [10, 160],
        ],
        2,
        2,
        { alpha: 10, beta: 10, Lmin: [0, 0], Lmax: [1, 1], Dj: [1, 1] },
      );
      const solution = highs.solve(lp);
      expect(solution.Status).toBe('Optimal');
      expect(service.parseSolution(solution)).toEqual(
        expect.arrayContaining([
          { i: 0, j: 0 },
          { i: 1, j: 1 },
        ]),
      );
    });
  });

  // --- parseSolution ---
  describe('parseSolution', () => {
    it('returns only x variables set to 1', () => {
      const result = service.parseSolution({
        Columns: {
          x_0_0: { Primal: 1 },
          x_1_0: { Primal: 0 },
          x_2_3: { Primal: 0.9999 },
          y_0: { Primal: 1 },
          z_0: { Primal: 1 },
        },
      });
      expect(result).toEqual([
        { i: 0, j: 0 },
        { i: 2, j: 3 },
      ]);
    });
  });

  // --- preview ---
  describe('preview', () => {
    const params: DistribuicaoParamsDto = {
      minimoProjetosPorAvaliador: 0,
      maximoProjetosPorAvaliador: 2,
      avaliadoresPorProjeto: 1,
    };

    it('throws NotFound when the edital does not exist', async () => {
      prismaMock.edital.findUnique.mockResolvedValue(null);
      await expect(service.preview(1, params)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects minimo greater than maximo', async () => {
      await expect(
        service.preview(1, { ...params, minimoProjetosPorAvaliador: 3 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('only loads projetos in distributable situations', async () => {
      await service.preview(1, params);
      const [[{ where }]] = prismaMock.projeto_pesquisa.findMany.mock.calls as [
        [{ where: { edital_id: number; situacao: { in: SituacaoProjeto[] } } }],
      ];
      expect(where.edital_id).toBe(1);
      expect(where.situacao.in).toContain(SituacaoProjeto.SUBMETIDO);
      expect(where.situacao.in).not.toContain(SituacaoProjeto.EXCLUIDO);
      expect(where.situacao.in).not.toContain(SituacaoProjeto.CADASTRO_EM_ANDAMENTO);
    });

    it('assigns each projeto to the consultor with the best affinity', async () => {
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([
        projetoRow(10, area()),
        projetoRow(20, outraArea),
      ]);
      prismaMock.edital_consultor.findMany.mockResolvedValue([
        consultorRow(1, 100, outraArea),
        consultorRow(2, 200, area()),
      ]);

      const result = await service.preview(1, params);

      expect(result.status).toBe('Optimal');
      expect(result.atribuicoes).toEqual(
        expect.arrayContaining([
          { projeto_id: 10, consultor_id: 2, avaliador_id: 200, score: 160, ...sugestao },
          { projeto_id: 20, consultor_id: 1, avaliador_id: 100, score: 160, ...sugestao },
        ]),
      );
      expect(result.atribuicoes).toHaveLength(2);
      expect(result.pendencias).toEqual([]);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('never assigns a consultor to a projeto with conflict and reports pendencias', async () => {
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([projetoRow(10, area(), [100])]);
      prismaMock.edital_consultor.findMany.mockResolvedValue([consultorRow(1, 100, area())]);

      const result = await service.preview(1, params);

      expect(result.atribuicoes).toEqual([]);
      expect(result.pendencias).toEqual([{ projeto_id: 10, faltando: 1 }]);
    });

    it('respects the maximum load per consultor', async () => {
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([
        projetoRow(10, area()),
        projetoRow(20, area()),
        projetoRow(30, area()),
      ]);
      prismaMock.edital_consultor.findMany.mockResolvedValue([consultorRow(1, 100, area())]);

      const result = await service.preview(1, params);

      expect(result.atribuicoes).toHaveLength(2);
      expect(result.carga).toEqual([{ consultor_id: 1, total: 2 }]);
      expect(result.pendencias).toHaveLength(1);
    });

    it('keeps pending and accepted invitations and only fills the open slots', async () => {
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([projetoRow(10, area())]);
      prismaMock.edital_consultor.findMany.mockResolvedValue([
        consultorRow(1, 100, area()),
        consultorRow(2, 200, area()),
        consultorRow(3, 300, area({ sub_area: 'other' })),
      ]);
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([
        avaliacaoRow(50, 10, 100, 1, ACEITO_COM_NOTAS),
        avaliacaoRow(51, 10, 200, 2),
      ]);

      const result = await service.preview(1, { ...params, avaliadoresPorProjeto: 3 });

      expect(result.atribuicoes).toEqual([
        {
          projeto_id: 10,
          consultor_id: 1,
          avaliador_id: 100,
          score: 160,
          existente: true,
          atribuicao_id: 50,
          status: StatusAtribuicao.ACEITO,
          tem_notas: true,
        },
        {
          projeto_id: 10,
          consultor_id: 2,
          avaliador_id: 200,
          score: 160,
          existente: true,
          atribuicao_id: 51,
          status: StatusAtribuicao.PENDENTE,
          tem_notas: false,
        },
        { projeto_id: 10, consultor_id: 3, avaliador_id: 300, score: 60, ...sugestao },
      ]);
      expect(result.pendencias).toEqual([]);
    });

    it('frees the slot of a declined invitation without suggesting the same consultor', async () => {
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([projetoRow(10, area())]);
      prismaMock.edital_consultor.findMany.mockResolvedValue([
        consultorRow(1, 100, area()),
        consultorRow(2, 200, area({ sub_area: 'other' })),
      ]);
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([
        avaliacaoRow(50, 10, 100, 1, RECUSADO),
      ]);

      const result = await service.preview(1, params);

      expect(result.atribuicoes).toEqual([
        { projeto_id: 10, consultor_id: 2, avaliador_id: 200, score: 60, ...sugestao },
      ]);
    });

    it('does not call the solver when there are no consultores', async () => {
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([projetoRow(10, area())]);
      const initSpy = jest.spyOn(service as any, 'initHighsModule');

      const result = await service.preview(1, params);

      expect(initSpy).not.toHaveBeenCalled();
      expect(result.status).toBe('Empty');
      expect(result.pendencias).toEqual([{ projeto_id: 10, faltando: 1 }]);
    });

    it('throws when the solver returns a status without solution', async () => {
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([projetoRow(10, area())]);
      prismaMock.edital_consultor.findMany.mockResolvedValue([consultorRow(1, 100, area())]);
      jest.spyOn(service as any, 'initHighsModule').mockResolvedValue({
        solve: () => ({ Status: 'Infeasible', Columns: {}, Rows: [], ObjectiveValue: 0 }),
      });

      await expect(service.preview(1, params)).rejects.toThrow('Infeasible');
    });
  });

  // --- confirm ---
  describe('confirm', () => {
    beforeEach(() => {
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([
        projetoRow(10, area()),
        projetoRow(20, area(), [300]),
      ]);
      prismaMock.edital_consultor.findMany.mockResolvedValue([
        consultorRow(1, 100, area()),
        consultorRow(2, 200, area()),
        consultorRow(3, 300, area()),
      ]);
    });

    it.each([
      [{ projeto_id: 99, consultor_id: 1 }, 'não pertence ao edital'],
      [{ projeto_id: 10, consultor_id: 99 }, 'não está vinculado ao edital'],
      [{ projeto_id: 20, consultor_id: 3 }, 'conflito de interesse'],
    ])('rejects invalid atribuicao %o', async (atribuicao, mensagem) => {
      const promise = service.confirm(1, { atribuicoes: [atribuicao] });
      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toMatchObject({
        response: { message: [expect.stringContaining(mensagem)] },
      });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('rejects duplicated atribuicoes', async () => {
      const atribuicao = { projeto_id: 10, consultor_id: 1 };
      await expect(
        service.confirm(1, { atribuicoes: [atribuicao, atribuicao] }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects assigning a consultor that declined the projeto', async () => {
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([
        avaliacaoRow(50, 10, 100, 1, RECUSADO),
      ]);

      const promise = service.confirm(1, { atribuicoes: [{ projeto_id: 10, consultor_id: 1 }] });
      await expect(promise).rejects.toMatchObject({
        response: { message: [expect.stringContaining('recusou o convite')] },
      });
    });

    it('syncs atribuicoes: creates new, removes dropped, keeps unchanged, graded and declined ones', async () => {
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([
        avaliacaoRow(50, 10, 100, 1), // mantida (enviada de novo)
        avaliacaoRow(51, 10, 200, 2), // removida (não enviada)
        avaliacaoRow(52, 20, 200, null, ACEITO_COM_NOTAS), // tem notas, antiga sem consultor_id
        avaliacaoRow(53, 10, 300, 3, RECUSADO), // histórico, nunca removida
      ]);
      txMock.plano_trabalho.findMany.mockResolvedValue([
        { id: 7, pesquisa_id: 20 },
        { id: 8, pesquisa_id: 20 },
      ]);

      const result = await service.confirm(1, {
        atribuicoes: [
          { projeto_id: 10, consultor_id: 1 },
          { projeto_id: 20, consultor_id: 1 },
        ],
      });

      expect(result).toEqual({ criadas: 1, removidas: 1, mantidas: 2 });
      expect(txMock.projeto_avaliacao.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [51] } },
      });
      expect(txMock.projeto_avaliacao.update).toHaveBeenCalledWith({
        where: { id: 52 },
        data: { consultor_id: 2 },
      });
      expect(txMock.projeto_avaliacao.create).toHaveBeenCalledTimes(1);
      expect(txMock.projeto_avaliacao.create).toHaveBeenCalledWith({
        data: {
          projeto_id: 20,
          avaliador_id: 100,
          consultor_id: 1,
          planos_avaliacao: { create: [{ plano_trabalho_id: 7 }, { plano_trabalho_id: 8 }] },
        },
      });
      const [[updateArgs]] = txMock.projeto_pesquisa.updateMany.mock.calls as [
        [{ where: { id: { in: number[] } }; data: { situacao: SituacaoProjeto } }],
      ];
      expect(updateArgs.where.id.in.sort()).toEqual([10, 20]);
      expect(updateArgs.data.situacao).toBe(
        SituacaoProjeto.DISTRIBUIDO_PARA_AVALIACAO_AUTOMATICAMENTE,
      );
    });

    it('never removes graded atribuicoes even when the list is empty', async () => {
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([
        avaliacaoRow(52, 20, 200, 2, ACEITO_COM_NOTAS),
      ]);

      const result = await service.confirm(1, { atribuicoes: [] });

      expect(result).toEqual({ criadas: 0, removidas: 0, mantidas: 1 });
      expect(txMock.projeto_avaliacao.deleteMany).not.toHaveBeenCalled();
    });
  });

  // --- candidatos ---
  describe('candidatos', () => {
    it('throws NotFound when the projeto is not distributable in the edital', async () => {
      await expect(service.candidatos(1, 10)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lists consultores without conflict ordered by score and load', async () => {
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([
        projetoRow(10, area(), [400]),
        projetoRow(20, area()),
      ]);
      prismaMock.edital_consultor.findMany.mockResolvedValue([
        consultorRow(1, 100, area({ sub_area: 'other' })),
        consultorRow(2, 200, area()),
        consultorRow(3, 300, area()),
        consultorRow(4, 400, area()), // membro do projeto 10
        consultorRow(5, 500, area()), // recusou o projeto 10
      ]);
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([
        avaliacaoRow(50, 20, 200, 2),
        avaliacaoRow(51, 10, 300, 3),
        avaliacaoRow(52, 10, 500, 5, RECUSADO),
      ]);

      const result = await service.candidatos(1, 10);

      expect(result).toEqual([
        { consultor_id: 2, nome: 'Consultor 2', score: 160, carga: 1, atribuido: false },
        { consultor_id: 3, nome: 'Consultor 3', score: 160, carga: 1, atribuido: true },
        { consultor_id: 1, nome: 'Consultor 1', score: 60, carga: 0, atribuido: false },
      ]);
    });
  });

  // --- panorama ---
  describe('panorama', () => {
    it('maps projetos and atribuicoes of the edital', async () => {
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([
        {
          id: 10,
          codigo: 'P-10',
          titulo: 'Projeto',
          situacao: SituacaoProjeto.SUBMETIDO,
          area_conhecimento: area(),
          unidade_academica: { sigla: 'CI' },
          projetoMembros: [{ user: { nome: 'Coord' } }],
        },
      ]);
      const criado = new Date('2026-10-01');
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([
        {
          ...avaliacaoRow(50, 10, 100, 1, RECUSADO),
          avaliador: { nome: 'Consultor 1' },
          motivo_recusa: 'Sem tempo',
          criado_em: criado,
          respondido_em: criado,
        },
      ]);

      const result = await service.panorama(1);

      expect(result).toEqual({
        projetos: [
          {
            id: 10,
            codigo: 'P-10',
            titulo: 'Projeto',
            situacao: SituacaoProjeto.SUBMETIDO,
            coordenador: 'Coord',
            unidade: 'CI',
            area_conhecimento: area(),
          },
        ],
        atribuicoes: [
          {
            id: 50,
            projeto_id: 10,
            consultor_id: 1,
            avaliador_id: 100,
            avaliador_nome: 'Consultor 1',
            status: StatusAtribuicao.RECUSADO,
            motivo_recusa: 'Sem tempo',
            tem_notas: false,
            criado_em: criado,
            respondido_em: criado,
          },
        ],
      });
    });
  });

  // --- minhasAtribuicoes ---
  describe('atribuicoesDoAvaliador', () => {
    it('lists the invitations of the user with projeto and edital', async () => {
      const criado = new Date('2026-10-01');
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([
        {
          ...avaliacaoRow(50, 10, 100, 1, ACEITO_COM_NOTAS),
          motivo_recusa: null,
          criado_em: criado,
          respondido_em: criado,
          projeto_pesquisa: {
            id: 10,
            codigo: 'P-10',
            titulo: 'Projeto',
            area_conhecimento: area(),
            edital_rel: { id: 1, codigo: 'ED-1', descricao: 'Edital', ano: 2026 },
          },
        },
      ]);

      const result = await service.atribuicoesDoAvaliador(100);

      const [[args]] = prismaMock.projeto_avaliacao.findMany.mock.calls as [
        [{ where: { avaliador_id: number } }],
      ];
      expect(args.where).toEqual({ avaliador_id: 100 });
      expect(result).toEqual([
        {
          id: 50,
          status: StatusAtribuicao.ACEITO,
          motivo_recusa: null,
          criado_em: criado,
          respondido_em: criado,
          tem_notas: true,
          projeto: { id: 10, codigo: 'P-10', titulo: 'Projeto', area_conhecimento: area() },
          edital: { id: 1, codigo: 'ED-1', descricao: 'Edital', ano: 2026 },
        },
      ]);
    });
  });

  // --- visões por consultor e por projeto ---
  describe('atribuicoesDoConsultor', () => {
    it('looks up the consultor user and filters by edital', async () => {
      prismaMock.consultor.findUnique.mockResolvedValue({ usuario_id: 100 });

      await service.atribuicoesDoConsultor(1, 7);

      const [[args]] = prismaMock.projeto_avaliacao.findMany.mock.calls as [[{ where: object }]];
      expect(args.where).toEqual({ avaliador_id: 100, projeto_pesquisa: { edital_id: 7 } });
    });

    it('throws NotFound for unknown consultor', async () => {
      prismaMock.consultor.findUnique.mockResolvedValue(null);
      await expect(service.atribuicoesDoConsultor(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('atribuicoesDoProjeto', () => {
    it('maps the invitations of the projeto', async () => {
      const criado = new Date('2026-10-01');
      prismaMock.projeto_pesquisa.findUnique.mockResolvedValue({ id: 10 });
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([
        {
          ...avaliacaoRow(50, 10, 100, 1, RECUSADO),
          avaliador: { nome: 'Consultor 1', email: 'c1@x.com' },
          motivo_recusa: 'Sem tempo',
          criado_em: criado,
          respondido_em: criado,
        },
      ]);

      expect(await service.atribuicoesDoProjeto(10)).toEqual([
        {
          id: 50,
          consultor_id: 1,
          avaliador_id: 100,
          avaliador_nome: 'Consultor 1',
          avaliador_email: 'c1@x.com',
          status: StatusAtribuicao.RECUSADO,
          motivo_recusa: 'Sem tempo',
          tem_notas: false,
          criado_em: criado,
          respondido_em: criado,
        },
      ]);
    });

    it('throws NotFound for unknown projeto', async () => {
      prismaMock.projeto_pesquisa.findUnique.mockResolvedValue(null);
      await expect(service.atribuicoesDoProjeto(10)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // --- responder ---
  describe('responder', () => {
    it('lets the invited avaliador accept a pending invitation', async () => {
      prismaMock.projeto_avaliacao.findUnique.mockResolvedValue({
        avaliador_id: 100,
        status: StatusAtribuicao.PENDENTE,
      });

      await service.responder(50, 100, true);

      const [[{ data }]] = prismaMock.projeto_avaliacao.update.mock.calls as [
        [{ data: { status: StatusAtribuicao; motivo_recusa: string | null } }],
      ];
      expect(data).toMatchObject({ status: StatusAtribuicao.ACEITO, motivo_recusa: null });
    });

    it('stores the reason when declining', async () => {
      prismaMock.projeto_avaliacao.findUnique.mockResolvedValue({
        avaliador_id: 100,
        status: StatusAtribuicao.PENDENTE,
      });

      await service.responder(50, 100, false, 'Sem disponibilidade');

      const [[{ data }]] = prismaMock.projeto_avaliacao.update.mock.calls as [
        [{ data: { status: StatusAtribuicao; motivo_recusa: string | null } }],
      ];
      expect(data).toMatchObject({
        status: StatusAtribuicao.RECUSADO,
        motivo_recusa: 'Sem disponibilidade',
      });
    });

    it('forbids other users from answering', async () => {
      prismaMock.projeto_avaliacao.findUnique.mockResolvedValue({
        avaliador_id: 100,
        status: StatusAtribuicao.PENDENTE,
      });
      await expect(service.responder(50, 999, true)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects answering twice', async () => {
      prismaMock.projeto_avaliacao.findUnique.mockResolvedValue({
        avaliador_id: 100,
        status: StatusAtribuicao.ACEITO,
      });
      await expect(service.responder(50, 100, false, 'x')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prismaMock.projeto_avaliacao.update).not.toHaveBeenCalled();
    });
  });
});
