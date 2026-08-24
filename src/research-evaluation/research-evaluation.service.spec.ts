import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ResearchEvaluationService } from './research-evaluation.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  plano_avaliacao: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  projeto_avaliacao: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  criterio_avaliacao: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(callback => callback(mockPrismaService)),
};

describe('ResearchEvaluationService', () => {
  let service: ResearchEvaluationService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchEvaluationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ResearchEvaluationService>(ResearchEvaluationService);
    prisma = module.get(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('submitPlanoEvaluation', () => {
    const activeCriterias = [
      { id: 1, nome: 'Critério 1', nota_maxima: 10, ativo: true },
      { id: 2, nome: 'Critério 2', nota_maxima: 5, ativo: true },
    ];

    it('deve lançar NotFoundException quando o plano de avaliação não existir', async () => {
      prisma.plano_avaliacao.findUnique.mockResolvedValue(null);

      await expect(
        service.submitPlanoEvaluation(1, { notas: [{ criterio_avaliacao_id: 1, nota: 8 }] }, 10),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando o avaliador for diferente do usuário autenticado', async () => {
      prisma.plano_avaliacao.findUnique.mockResolvedValue({
        id: 1,
        projeto_avaliacao: { avaliador_id: 99 },
        notas: [],
      });

      await expect(
        service.submitPlanoEvaluation(1, { notas: [{ criterio_avaliacao_id: 1, nota: 8 }] }, 10),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException quando o plano já tiver sido avaliado', async () => {
      prisma.plano_avaliacao.findUnique.mockResolvedValue({
        id: 1,
        projeto_avaliacao: { avaliador_id: 10 },
        notas: [{ id: 1, nota: 9 }],
      });

      await expect(
        service.submitPlanoEvaluation(1, { notas: [{ criterio_avaliacao_id: 1, nota: 8 }] }, 10),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException quando houver critérios repetidos', async () => {
      prisma.plano_avaliacao.findUnique.mockResolvedValue({
        id: 1,
        projeto_avaliacao: { avaliador_id: 10 },
        notas: [],
      });
      prisma.criterio_avaliacao.findMany.mockResolvedValue(activeCriterias);

      await expect(
        service.submitPlanoEvaluation(
          1,
          {
            notas: [
              { criterio_avaliacao_id: 1, nota: 8 },
              { criterio_avaliacao_id: 1, nota: 7 },
            ],
          },
          10,
        ),
      ).rejects.toThrow('Critérios de avaliação repetidos');
    });

    it('deve lançar BadRequestException quando faltarem critérios ativos', async () => {
      prisma.plano_avaliacao.findUnique.mockResolvedValue({
        id: 1,
        projeto_avaliacao: { avaliador_id: 10 },
        notas: [],
      });
      prisma.criterio_avaliacao.findMany.mockResolvedValue(activeCriterias);

      await expect(
        service.submitPlanoEvaluation(
          1,
          {
            notas: [{ criterio_avaliacao_id: 1, nota: 8 }],
          },
          10,
        ),
      ).rejects.toThrow('A avaliação do plano deve conter exatamente todos os critérios ativos');
    });

    it('deve lançar BadRequestException quando a nota exceder a nota máxima do critério', async () => {
      prisma.plano_avaliacao.findUnique.mockResolvedValue({
        id: 1,
        projeto_avaliacao: { avaliador_id: 10 },
        notas: [],
      });
      prisma.criterio_avaliacao.findMany.mockResolvedValue(activeCriterias);

      await expect(
        service.submitPlanoEvaluation(
          1,
          {
            notas: [
              { criterio_avaliacao_id: 1, nota: 9 },
              { criterio_avaliacao_id: 2, nota: 6 }, // Max is 5
            ],
          },
          10,
        ),
      ).rejects.toThrow(/excede a nota máxima permitida/);
    });

    it('deve registrar as notas do plano com sucesso', async () => {
      prisma.plano_avaliacao.findUnique.mockResolvedValue({
        id: 1,
        projeto_avaliacao: { avaliador_id: 10 },
        notas: [],
      });
      prisma.criterio_avaliacao.findMany.mockResolvedValue(activeCriterias);

      const mockUpdated = {
        id: 1,
        descricao: 'Ótimo plano',
        notas: [
          { criterio_avaliacao_id: 1, nota: 9 },
          { criterio_avaliacao_id: 2, nota: 4 },
        ],
      };
      prisma.plano_avaliacao.update.mockResolvedValue(mockUpdated);

      const result = await service.submitPlanoEvaluation(
        1,
        {
          descricao: 'Ótimo plano',
          notas: [
            { criterio_avaliacao_id: 1, nota: 9 },
            { criterio_avaliacao_id: 2, nota: 4 },
          ],
        },
        10,
      );

      expect(result).toEqual(mockUpdated);
      expect(prisma.plano_avaliacao.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          descricao: 'Ótimo plano',
          notas: {
            create: [
              { criterio_avaliacao_id: 1, nota: 9 },
              { criterio_avaliacao_id: 2, nota: 4 },
            ],
          },
        },
        include: {
          notas: { include: { criterio_avaliacao: true } },
        },
      });
    });
  });

  describe('submitEvaluation', () => {
    const activeCriterias = [
      { id: 1, nome: 'Critério 1', nota_maxima: 10, ativo: true },
      { id: 2, nome: 'Critério 2', nota_maxima: 10, ativo: true },
    ];

    it('deve lançar BadRequestException se houver plano de trabalho pendente de avaliação', async () => {
      prisma.projeto_avaliacao.findUnique.mockResolvedValue({
        id: 1,
        avaliador_id: 10,
        notas: [],
        planos_avaliacao: [
          { id: 1, notas: [{ id: 1, nota: 10 }] },
          { id: 2, notas: [] }, // Pendente
        ],
      });

      await expect(
        service.submitEvaluation(
          1,
          {
            notas: [
              { criterio_avaliacao_id: 1, nota: 9 },
              { criterio_avaliacao_id: 2, nota: 8 },
            ],
          },
          10,
        ),
      ).rejects.toThrow(
        'Todos os planos de trabalho do projeto devem ser avaliados antes da nota do projeto',
      );
    });

    it('deve lançar BadRequestException quando nota exceder a nota máxima', async () => {
      prisma.projeto_avaliacao.findUnique.mockResolvedValue({
        id: 1,
        avaliador_id: 10,
        notas: [],
        planos_avaliacao: [{ id: 1, notas: [{ id: 1, nota: 10 }] }],
      });
      prisma.criterio_avaliacao.findMany.mockResolvedValue(activeCriterias);

      await expect(
        service.submitEvaluation(
          1,
          {
            notas: [
              { criterio_avaliacao_id: 1, nota: 12 }, // Exceeds 10
              { criterio_avaliacao_id: 2, nota: 8 },
            ],
          },
          10,
        ),
      ).rejects.toThrow(/excede a nota máxima permitida/);
    });

    it('deve submeter a avaliação do projeto com sucesso quando todos os planos estão avaliados', async () => {
      prisma.projeto_avaliacao.findUnique.mockResolvedValue({
        id: 1,
        avaliador_id: 10,
        notas: [],
        planos_avaliacao: [{ id: 1, notas: [{ id: 1, nota: 10 }] }],
      });
      prisma.criterio_avaliacao.findMany.mockResolvedValue(activeCriterias);

      const mockUpdated = {
        id: 1,
        descricao: 'Excelente projeto',
        notas: [
          { criterio_avaliacao_id: 1, nota: 9 },
          { criterio_avaliacao_id: 2, nota: 8 },
        ],
      };
      prisma.projeto_avaliacao.update.mockResolvedValue(mockUpdated);

      const result = await service.submitEvaluation(
        1,
        {
          descricao: 'Excelente projeto',
          notas: [
            { criterio_avaliacao_id: 1, nota: 9 },
            { criterio_avaliacao_id: 2, nota: 8 },
          ],
        },
        10,
      );

      expect(result).toEqual(mockUpdated);
    });
  });
});
