import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkPlanDto } from './dto/create-work-plan.dto';
import { UpdateWorkPlanDto } from './dto/update-work-plan.dto';
import { WorkPlanService } from './work-plan.service';

const mockPrismaService = {
  $transaction: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  discente: {
    findUnique: jest.fn(),
  },
  usuario: {
    findUnique: jest.fn(),
  },
  cronograma: {
    findUnique: jest.fn(),
  },
  projeto_pesquisa: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  plano_trabalho: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  atividade_plano_trabalho: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  mes_plano_trabalho: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  corpo_plano_trabalho: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
};

describe('WorkPlanService', () => {
  let service: WorkPlanService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    mockPrismaService.$transaction.mockImplementation(async callback =>
      callback(mockPrismaService),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkPlanService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WorkPlanService>(WorkPlanService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateWorkPlanDto = {
      discente_id: 1,
      usuario_id: 1,
      pesquisa_id: 1,
      modalidade: 'PIBIC',
      status: 'ATIVO',
      tipo_bolsa: 'REMUNERADA',
      cronograma_id: 7,
      direcionamento_plano: 'Direcionamento',
      corpo_id: 99,
      corpo_plano_trabalho: {
        titulo: 'Titulo',
        introducao: 'Introducao',
        objetivos: 'Objetivos',
        metodologia: 'Metodologia',
        referencias: 'Referencias',
      },
      atividades: [
        {
          descricao: 'Atividade 1',
          meses: [{ data: '2026-03-01' }],
        },
      ],
    };

    it('deve criar plano de trabalho com sucesso', async () => {
      prisma.discente.findUnique.mockResolvedValue({ id: 1 });
      prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
      prisma.cronograma.findUnique.mockResolvedValue({ id: 7 });
      prisma.projeto_pesquisa.findUnique.mockResolvedValue({ id: 1 });
      prisma.corpo_plano_trabalho.create.mockResolvedValue({ id: 99 });
      prisma.plano_trabalho.create.mockResolvedValue({ id: 1, ...createDto });
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.projeto_pesquisa.update.mockResolvedValue({
        id: 1,
        plano_trabalho_id: 1,
      });
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.create({ ...createDto, atividades: [] });

      expect(prisma.plano_trabalho.create).toHaveBeenCalled();
      expect(result.id).toEqual(1);
    });

    it('deve lançar erro quando discente não existe', async () => {
      prisma.discente.findUnique.mockResolvedValue(null);
      prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
      prisma.cronograma.findUnique.mockResolvedValue({ id: 7 });
      prisma.projeto_pesquisa.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(prisma.plano_trabalho.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar resultados paginados', async () => {
      prisma.plano_trabalho.findMany.mockResolvedValue([{ id: 1 }]);
      prisma.plano_trabalho.count.mockResolvedValue(1);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.findAll(10, 0);

      expect(result).toEqual({
        total: 1,
        limit: 10,
        offset: 0,
        results: [{ id: 1, atividades: [] }],
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar o plano quando existir', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.findOne(1);

      expect(result).toEqual({ id: 1, atividades: [] });
    });

    it('deve lançar NotFoundException quando não existir', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue(null);

      await expect(service.findOne(123)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateWorkPlanDto = {
      status: 'EM_REVISAO',
      atividades: [],
    };

    it('deve atualizar com sucesso', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        discente_id: 1,
        usuario_id: 1,
        pesquisa_id: 1,
        cronograma_id: 7,
        corpo_id: 99,
        projeto_pesquisa: [{ id: 1 }],
      });
      prisma.plano_trabalho.update.mockResolvedValue({ id: 1 });
      prisma.discente.findUnique.mockResolvedValue({ id: 1 });
      prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
      prisma.cronograma.findUnique.mockResolvedValue({ id: 7 });
      prisma.projeto_pesquisa.findUnique.mockResolvedValue({ id: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([]);
      prisma.$executeRawUnsafe.mockResolvedValue(0);

      const result = await service.update(1, updateDto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.id).toEqual(1);
    });
  });

  describe('remove', () => {
    it('deve remover com sucesso', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([]);
      prisma.plano_trabalho.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(prisma.plano_trabalho.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          corpo_plano_trabalho: true,
          discente: true,
          usuario: true,
          projeto_pesquisa: true,
        },
      });
      expect(result).toEqual({ id: 1 });
    });
  });
});
