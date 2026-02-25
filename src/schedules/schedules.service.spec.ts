import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

// Mock do PrismaService
const mockPrismaService = {
  atividade: {
    findUnique: jest.fn(),
  },
  cronograma: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SchedulesService', () => {
  let service: SchedulesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateScheduleDto = {
      data_inicio: new Date('2025-01-01'),
      data_fim: new Date('2025-01-02'),
      atividade_id: 1,
    };

    it('deve criar um cronograma com sucesso', async () => {
      prisma.atividade.findUnique.mockResolvedValue({ id: 1, nome: 'Teste' });
      prisma.cronograma.create.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);

      expect(prisma.atividade.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.cronograma.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, ...createDto });
    });

    it('deve lançar NotFoundException se a atividade não existir', async () => {
      prisma.atividade.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(prisma.cronograma.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista paginada de cronogramas', async () => {
      const mockData = [{ id: 1, data_inicio: new Date() }];
      const mockTotal = 1;
      const limit = 10;
      const offset = 0;

      prisma.cronograma.findMany.mockResolvedValue(mockData);
      prisma.cronograma.count.mockResolvedValue(mockTotal);

      const result = await service.findAll(limit, offset);

      expect(prisma.cronograma.findMany).toHaveBeenCalledWith({
        take: limit,
        skip: offset,
        orderBy: { data_inicio: 'asc' },
        include: { atividade: true },
      });
      expect(result).toEqual({
        total: mockTotal,
        limit,
        offset,
        results: mockData,
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um cronograma se encontrado', async () => {
      const mockSchedule = { id: 1, atividade_id: 1 };
      prisma.cronograma.findUnique.mockResolvedValue(mockSchedule);

      const result = await service.findOne(1);

      expect(result).toEqual(mockSchedule);
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      prisma.cronograma.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateScheduleDto = { atividade_id: 2 };

    it('deve atualizar um cronograma com sucesso', async () => {
      // Mock do findOne (existência do cronograma)
      prisma.cronograma.findUnique.mockResolvedValue({ id: 1, atividade_id: 1 });
      // Mock da verificação da nova atividade
      prisma.atividade.findUnique.mockResolvedValue({ id: 2 });
      // Mock do update
      prisma.cronograma.update.mockResolvedValue({ id: 1, atividade_id: 2 });

      const result = await service.update(1, updateDto);

      expect(prisma.cronograma.update).toHaveBeenCalled();
      expect(result.atividade_id).toBe(2);
    });

    it('deve lançar NotFoundException se a nova atividade não existir', async () => {
      prisma.cronograma.findUnique.mockResolvedValue({ id: 1, atividade_id: 1 });
      prisma.atividade.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(prisma.cronograma.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um cronograma com sucesso', async () => {
      prisma.cronograma.findUnique.mockResolvedValue({ id: 1 });
      prisma.cronograma.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(prisma.cronograma.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { atividade: true },
      });
      expect(result).toEqual({ id: 1 });
    });

    it('deve lançar NotFoundException se o cronograma não existir', async () => {
      prisma.cronograma.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(prisma.cronograma.delete).not.toHaveBeenCalled();
    });
  });
});