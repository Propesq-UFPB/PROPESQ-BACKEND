import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FundingAgencyService } from './funding-agency.service';

const mockAgency = {
  id: 1,
  nome: 'CNPq',
  criado_em: new Date('2026-07-14T00:00:00.000Z'),
  atualizado_em: new Date('2026-07-14T00:00:00.000Z'),
};

const mockPrismaService = {
  orgao_financiador: {
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  bolsa: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('FundingAgencyService', () => {
  let service: FundingAgencyService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FundingAgencyService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get(FundingAgencyService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um órgão', async () => {
      prisma.orgao_financiador.create.mockResolvedValue(mockAgency);

      const result = await service.create({ nome: '  CNPq  ' });

      expect(prisma.orgao_financiador.create).toHaveBeenCalledWith({
        data: { nome: 'CNPq' },
      });
      expect(result).toEqual({
        id: 1,
        nome: 'CNPq',
        criado_em: mockAgency.criado_em.toISOString(),
        atualizado_em: mockAgency.atualizado_em.toISOString(),
      });
    });

    it('deve lançar ConflictException quando o nome já existe', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: 'test',
      });
      prisma.orgao_financiador.create.mockRejectedValue(error);

      await expect(service.create({ nome: 'CNPq' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('deve retornar o órgão quando encontrado', async () => {
      prisma.orgao_financiador.findUnique.mockResolvedValue(mockAgency);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.nome).toBe('CNPq');
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      prisma.orgao_financiador.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve excluir quando não há bolsas associadas', async () => {
      prisma.orgao_financiador.findUnique.mockResolvedValue(mockAgency);
      prisma.bolsa.findFirst.mockResolvedValue(null);
      prisma.orgao_financiador.delete.mockResolvedValue(mockAgency);

      await service.remove(1);

      expect(prisma.orgao_financiador.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('deve lançar ConflictException quando há bolsas associadas', async () => {
      prisma.orgao_financiador.findUnique.mockResolvedValue(mockAgency);
      prisma.bolsa.findFirst.mockResolvedValue({ id: 10 });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(prisma.orgao_financiador.delete).not.toHaveBeenCalled();
    });
  });
});
