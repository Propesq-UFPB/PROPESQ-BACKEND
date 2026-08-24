import { Test, TestingModule } from '@nestjs/testing';
import { DistribuicaoService } from './distribuicao.service';
import { PrismaService } from '../prisma/prisma.service';
import { area_conhecimento } from '@prisma/client';
import { DistribuicaoParamsDto } from './dto/distribute.dto';

const prismaMock = {
  projeto_pesquisa: {
    findMany: jest.fn(),
  },
  docente: {
    findMany: jest.fn(),
  },
  projeto_avaliacao: {
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

class TestableDistribuicaoService extends DistribuicaoService {
  public calcScoreMatrix(
    projetos: Array<{ area_conhecimento: area_conhecimento | null; avaliador_id: number | null }>,
    docentes: Array<{ area_conhecimento: area_conhecimento | null; usuario_id: number }>,
  ) {
    return super['calcScoreMatrix'](projetos, docentes);
  }

  public buildLpProblem(
    benefitMatrix: (number | null)[][],
    n: number,
    m: number,
    params: { alpha: number; beta: number; Lmin: number; Lmax: number; Dj: number },
  ) {
    return super['buildLpProblem'](benefitMatrix, n, m, params);
  }

  public parseSolution(
    solution: { Columns: Record<string, { Primal: number }> },
    projetosPesquisa: Array<{ id: number }>,
    docentes: Array<{ usuario_id: number }>,
  ) {
    return super['parseSolution'](solution, projetosPesquisa, docentes);
  }
}

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
  });

  afterEach(() => jest.clearAllMocks());

  // --- calcScoreMatrix ---
  describe('calcScoreMatrix', () => {
    const area = (overrides: Partial<area_conhecimento> = {}): area_conhecimento => ({
      id: 1,
      grande_area: 'Ciências Exatas',
      area: 'Computação',
      sub_area: 'IA',
      especialidade: 'ML',
      ...overrides,
    });

    it('returns null for self-assignment (avaliador_id === usuario_id)', () => {
      const projetos = [{ area_conhecimento: area(), avaliador_id: 1 }];
      const docentes = [{ area_conhecimento: area(), usuario_id: 1 }];
      const matrix = service.calcScoreMatrix(projetos, docentes);
      expect(matrix[0][0]).toBeNull();
    });

    it('returns 0 when projeto has no area_conhecimento', () => {
      const projetos = [{ area_conhecimento: null, avaliador_id: null }];
      const docentes = [{ area_conhecimento: area(), usuario_id: 1 }];
      const matrix = service.calcScoreMatrix(projetos, docentes);
      expect(matrix[0][0]).toBe(0);
    });

    it('returns 0 when docente has no area_conhecimento', () => {
      const projetos = [{ area_conhecimento: area(), avaliador_id: null }];
      const docentes = [{ area_conhecimento: null, usuario_id: 1 }];
      const matrix = service.calcScoreMatrix(projetos, docentes);
      expect(matrix[0][0]).toBe(0);
    });

    it('scores full match correctly', () => {
      const projetos = [{ area_conhecimento: area(), avaliador_id: null }];
      const docentes = [{ area_conhecimento: area(), usuario_id: 1 }];
      const matrix = service.calcScoreMatrix(projetos, docentes);
      expect(matrix[0][0]).toBe(160); // 10 + 50 + 100 (especialidade desativada)
    });

    it('scores partial matches correctly', () => {
      const projetos = [{ area_conhecimento: area(), avaliador_id: null }];
      const docentes = [
        { area_conhecimento: area({ especialidade: 'other' }), usuario_id: 1 }, // 10+50+100 = 160
        { area_conhecimento: area({ sub_area: 'other', especialidade: 'other' }), usuario_id: 2 }, // 10+50 = 60
        {
          area_conhecimento: area({ area: 'other', sub_area: 'other', especialidade: 'other' }),
          usuario_id: 3,
        }, // 10
      ];
      const matrix = service.calcScoreMatrix(projetos, docentes);
      expect(matrix[0][0]).toBe(160);
      expect(matrix[1][0]).toBe(60);
      expect(matrix[2][0]).toBe(10);
    });

    it('handles multiple projetos and docentes', () => {
      const projetos = [
        { area_conhecimento: area(), avaliador_id: null },
        { area_conhecimento: null, avaliador_id: 2 },
      ];
      const docentes = [
        { area_conhecimento: area(), usuario_id: 1 },
        { area_conhecimento: null, usuario_id: 2 },
      ];
      const matrix = service.calcScoreMatrix(projetos, docentes);
      expect(matrix).toHaveLength(2); // m docentes
      expect(matrix[0]).toHaveLength(2); // n projetos
      expect(matrix[0][0]).toBe(160);
      expect(matrix[1][1]).toBeNull(); // avaliador_id 2 === usuario_id 2
    });
  });

  // --- buildLpProblem ---
  describe('buildLpProblem', () => {
    const params = { alpha: 10, beta: 10, Lmin: 1, Lmax: 2, Dj: 1 };

    it('contains objective function', () => {
      const matrix = [
        [360, 0],
        [0, 200],
      ];
      const lp = service.buildLpProblem(matrix, 2, 2, params);
      expect(lp).toContain('max:');
    });

    it('declares binary variables', () => {
      const matrix = [
        [360, 0],
        [0, 200],
      ];
      const lp = service.buildLpProblem(matrix, 2, 2, params);
      expect(lp).toContain('bin');
    });

    it('includes y and z slack variables in objective', () => {
      const matrix = [
        [100, 0],
        [0, 100],
      ];
      const lp = service.buildLpProblem(matrix, 2, 2, params);
      expect(lp).toContain('y_0');
      expect(lp).toContain('y_1');
      expect(lp).toContain('z_0');
      expect(lp).toContain('z_1');
    });

    it('excludes null pairs from binary variables', () => {
      const matrix = [
        [null, 100],
        [200, null],
      ];
      const lp = service.buildLpProblem(matrix, 2, 2, params);
      expect(lp).not.toContain('x_0_0');
      expect(lp).not.toContain('x_1_1');
      expect(lp).toContain('x_0_1');
      expect(lp).toContain('x_1_0');
    });

    it('includes non-negativity bounds for y and z', () => {
      const matrix = [[100]];
      const lp = service.buildLpProblem(matrix, 1, 1, params);
      expect(lp).toContain('y_0 >= 0');
      expect(lp).toContain('z_0 >= 0');
    });

    it('respects d_j in C1 constraint', () => {
      const matrix = [[100]];
      const lp = service.buildLpProblem(matrix, 1, 1, { ...params, Dj: 2 });
      expect(lp).toContain('= 2');
    });
  });

  // --- hasDistribuicao ---
  describe('hasDistribuicao', () => {
    it('returns true when a projeto_avaliacao exists', async () => {
      prismaMock.projeto_avaliacao.findFirst.mockResolvedValue({ id: 1 });
      expect(await service.hasDistribuicao(1)).toBe(true);
    });

    it('returns false when none exists', async () => {
      prismaMock.projeto_avaliacao.findFirst.mockResolvedValue(null);
      expect(await service.hasDistribuicao(1)).toBe(false);
    });
  });

  // --- parseSolution ---
  describe('parseSolution', () => {
    it('maps x variables to projeto/docente pairs', () => {
      const solution = {
        Columns: {
          x_0_0: { Primal: 1 },
          x_1_1: { Primal: 1 },
        },
      };
      const projetos = [{ id: 10 }, { id: 20 }];
      const docentes = [{ usuario_id: 100 }, { usuario_id: 200 }];
      const result = service.parseSolution(solution, projetos, docentes);
      expect(result).toEqual(
        expect.arrayContaining([
          { projeto_id: 10, avaliador_ids: [100] },
          { projeto_id: 20, avaliador_ids: [200] },
        ]),
      );
    });

    it('groups multiple docentes for the same project', () => {
      const solution = {
        Columns: {
          x_0_0: { Primal: 1 },
          x_1_0: { Primal: 1 },
        },
      };
      const projetos = [{ id: 10 }];
      const docentes = [{ usuario_id: 100 }, { usuario_id: 200 }];
      const result = service.parseSolution(solution, projetos, docentes);
      expect(result).toEqual([{ projeto_id: 10, avaliador_ids: [100, 200] }]);
    });

    it('ignores variables with Primal !== 1', () => {
      const solution = {
        Columns: {
          x_0_0: { Primal: 0 },
          x_1_0: { Primal: 0.4 },
        },
      };
      const projetos = [{ id: 10 }];
      const docentes = [{ usuario_id: 100 }, { usuario_id: 200 }];
      const result = service.parseSolution(solution, projetos, docentes);
      expect(result).toEqual([]);
    });

    it('ignores y and z variables', () => {
      const solution = {
        Columns: {
          y_0: { Primal: 1 },
          z_0: { Primal: 1 },
        },
      };
      const result = service.parseSolution(solution, [], []);
      expect(result).toEqual([]);
    });
  });

  // --- distribute ---
  describe('distribute', () => {
    const params: DistribuicaoParamsDto = {
      minimoProjetosPorAvaliador: 1,
      maximoProjetosPorAvaliador: 3,
      avaliadoresPorProjeto: 2,
    };

    const solverMock = {
      solve: jest.fn().mockReturnValue({
        Status: 'Optimal',
        ObjectiveValue: 360,
        Columns: {
          x_0_0: { Primal: 1 },
          x_1_1: { Primal: 1 },
          y_0: { Primal: 0 },
          z_0: { Primal: 0 },
        },
        Rows: [],
      }),
    };

    beforeEach(() => {
      jest.spyOn(service as any, 'initHighsModule').mockResolvedValue(solverMock);
      prismaMock.projeto_pesquisa.findMany.mockResolvedValue([
        { id: 1, area_conhecimento: null, avaliador_id: null, edital_id: 1 },
        { id: 2, area_conhecimento: null, avaliador_id: null, edital_id: 1 },
      ]);
      prismaMock.docente.findMany.mockResolvedValue([
        { id: 1, usuario_id: 10, area_conhecimento: null },
        { id: 2, usuario_id: 20, area_conhecimento: null },
      ]);
      prismaMock.$transaction.mockResolvedValue(undefined);
    });

    it('calls solver and saves solution', async () => {
      await service.distribute(1, params);
      expect(solverMock.solve).toHaveBeenCalledTimes(1);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('passes the editalId to findMany', async () => {
      await service.distribute(1, params);
      expect(prismaMock.projeto_pesquisa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { edital_id: 1 } }),
      );
    });

    it('throws if solver returns non-optimal status', async () => {
      solverMock.solve.mockReturnValueOnce({
        Status: 'Infeasible',
        Columns: {},
        Rows: [],
        ObjectiveValue: 0,
      });
      await expect(service.distribute(1, params)).rejects.toThrow();
    });
  });
});
