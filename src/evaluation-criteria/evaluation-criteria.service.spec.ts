import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationCriteriaService } from './evaluation-criteria.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateEvaluationCriterionDto } from './dto/create-evaluation-criterion.dto';

const mockCriterion = {
  id: 1,
  nome: 'Metodologia',
  descricao: 'Avalia a metodologia.',
  peso: 0.3,
  nota_maxima: 10,
  ativo: true,
  criado_em: new Date('2026-06-06'),
  atualizado_em: new Date('2026-06-06'),
  desativado_em: null,
};

const mockPrismaService = {
  criterio_avaliacao: {
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('EvaluationCriteriaService', () => {
  let service: EvaluationCriteriaService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationCriteriaService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EvaluationCriteriaService>(EvaluationCriteriaService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateEvaluationCriterionDto = {
      nome: 'Metodologia',
      descricao: 'Avalia a metodologia.',
      peso: 0.3,
      nota_maxima: 10,
    };

    it('deve criar um critério com ativo=true por padrão', async () => {
      prisma.criterio_avaliacao.create.mockResolvedValue(mockCriterion);

      const result = await service.create(createDto);

      expect(prisma.criterio_avaliacao.create).toHaveBeenCalledWith({
        data: {
          nome: createDto.nome,
          descricao: createDto.descricao,
          peso: createDto.peso,
          nota_maxima: createDto.nota_maxima,
          ativo: true,
        },
      });
      expect(result.id).toBe(1);
      expect(result.nome).toBe('Metodologia');
    });
  });

  describe('findOne', () => {
    it('deve retornar o critério quando encontrado', async () => {
      prisma.criterio_avaliacao.findUnique.mockResolvedValue(mockCriterion);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      prisma.criterio_avaliacao.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve definir desativado_em ao desativar o critério', async () => {
      prisma.criterio_avaliacao.findUnique.mockResolvedValue(mockCriterion);
      prisma.criterio_avaliacao.update.mockResolvedValue({
        ...mockCriterion,
        ativo: false,
        desativado_em: new Date(),
      });

      await service.update(1, { ativo: false });

      expect(prisma.criterio_avaliacao.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          ativo: false,
          desativado_em: expect.any(Date),
        }),
      });
    });

    it('deve limpar desativado_em ao reativar o critério', async () => {
      prisma.criterio_avaliacao.findUnique.mockResolvedValue({
        ...mockCriterion,
        ativo: false,
        desativado_em: new Date(),
      });
      prisma.criterio_avaliacao.update.mockResolvedValue(mockCriterion);

      await service.update(1, { ativo: true });

      expect(prisma.criterio_avaliacao.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          ativo: true,
          desativado_em: null,
        }),
      });
    });
  });

  describe('remove', () => {
    it('deve realizar soft delete definindo ativo=false e desativado_em', async () => {
      prisma.criterio_avaliacao.findUnique.mockResolvedValue(mockCriterion);
      prisma.criterio_avaliacao.update.mockResolvedValue({
        ...mockCriterion,
        ativo: false,
        desativado_em: new Date(),
      });

      await service.remove(1);

      expect(prisma.criterio_avaliacao.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ativo: false, desativado_em: expect.any(Date) },
      });
    });
  });
});
