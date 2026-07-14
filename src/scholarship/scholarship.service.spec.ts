import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ScholarshipService } from './scholarship.service';

const mockOrgao = { id: 1, nome: 'CNPq' };

const mockBolsa = {
  id: 1,
  descricao: 'PIBIC',
  categoria: 'PIBIC',
  dia_limite_indicacao: 15,
  dia_limite_finalizacao: 20,
  niveis: '111',
  vinculado_cota: false,
  necessita_relatorio: false,
  necessidade_dados_bancarios: false,
  possui_bancos_exclusivos: false,
  possui_tipo_conta_excls: false,
  envio_relatorio_inicio: new Date('2026-01-01'),
  envio_relatorio_fim: new Date('2026-12-31'),
  orgao_id: 1,
  valor: new Prisma.Decimal(700),
  permite_acumulo: false,
  orgao: mockOrgao,
};

const mockPrismaService = {
  bolsa: {
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  orgao_financiador: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('ScholarshipService', () => {
  let service: ScholarshipService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScholarshipService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get(ScholarshipService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFromSettings', () => {
    it('deve criar bolsa com defaults técnicos', async () => {
      prisma.orgao_financiador.findUnique.mockResolvedValue(mockOrgao);
      prisma.bolsa.create.mockResolvedValue(mockBolsa);

      const result = await service.createFromSettings({
        descricao: 'PIBIC',
        orgao_id: 1,
        valor: 700,
        permite_acumulo: false,
      });

      expect(prisma.bolsa.create).toHaveBeenCalled();
      const createCalls = prisma.bolsa.create.mock.calls as Array<
        [
          {
            data: {
              categoria: string;
              dia_limite_indicacao: number;
              niveis: string;
              orgao_id: number;
            };
          },
        ]
      >;
      const createArg = createCalls[0][0];
      expect(createArg.data.categoria).toBe('PIBIC');
      expect(createArg.data.dia_limite_indicacao).toBe(15);
      expect(createArg.data.niveis).toBe('111');
      expect(createArg.data.orgao_id).toBe(1);
      expect(result.descricao).toBe('PIBIC');
      expect(result.valor).toBe(700);
      expect(result.orgao?.nome).toBe('CNPq');
    });

    it('deve lançar NotFoundException quando o órgão não existe', async () => {
      prisma.orgao_financiador.findUnique.mockResolvedValue(null);

      await expect(
        service.createFromSettings({
          descricao: 'PIBIC',
          orgao_id: 99,
        }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.bolsa.create).not.toHaveBeenCalled();
    });
  });
});
