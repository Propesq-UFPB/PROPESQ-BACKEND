import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  docente: {
    findUnique: jest.fn(),
  },
  projeto_avaliacao: {
    findMany: jest.fn(),
  },
};

describe('DocentesService', () => {
  let service: DocentesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocentesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DocentesService>(DocentesService);
    prisma = module.get(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findEvaluationAssignments', () => {
    it('deve lançar NotFoundException quando o docente não existir', async () => {
      prisma.docente.findUnique.mockResolvedValue(null);

      await expect(service.findEvaluationAssignments(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.docente.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('deve lançar ForbiddenException quando usuário não for o docente nem gestor/admin', async () => {
      prisma.docente.findUnique.mockResolvedValue({ id: 1, usuario_id: 10 });

      await expect(
        service.findEvaluationAssignments(1, {
          userId: 20,
          email: 'outro@test.com',
          nome: 'Outro',
          funcao: 'DOCENTE',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir quando o usuário autenticado for o próprio docente', async () => {
      const mockAssignments = [
        {
          id: 1,
          projeto_id: 100,
          avaliador_id: 10,
          projeto_pesquisa: { id: 100, titulo: 'Projeto 1' },
          notas: [],
          planos_avaliacao: [],
        },
      ];

      prisma.docente.findUnique.mockResolvedValue({ id: 1, usuario_id: 10 });
      prisma.projeto_avaliacao.findMany.mockResolvedValue(mockAssignments);

      const result = await service.findEvaluationAssignments(1, {
        userId: 10,
        email: 'docente@test.com',
        nome: 'Docente',
        funcao: 'DOCENTE',
      });

      expect(result).toEqual(mockAssignments);
      expect(prisma.projeto_avaliacao.findMany).toHaveBeenCalledWith({
        where: { avaliador_id: 10 },
        include: {
          projeto_pesquisa: true,
          notas: {
            include: { criterio_avaliacao: true },
          },
          planos_avaliacao: {
            include: {
              plano_trabalho: true,
              notas: {
                include: { criterio_avaliacao: true },
              },
            },
          },
        },
      });
    });

    it('deve permitir quando o usuário for GESTOR ou ADMIN', async () => {
      const mockAssignments = [{ id: 1, projeto_id: 100, avaliador_id: 10 }];

      prisma.docente.findUnique.mockResolvedValue({ id: 1, usuario_id: 10 });
      prisma.projeto_avaliacao.findMany.mockResolvedValue(mockAssignments);

      const resultGestor = await service.findEvaluationAssignments(1, {
        userId: 99,
        email: 'gestor@test.com',
        nome: 'Gestor',
        funcao: 'GESTOR',
      });

      expect(resultGestor).toEqual(mockAssignments);

      const resultAdmin = await service.findEvaluationAssignments(1, {
        userId: 99,
        email: 'admin@test.com',
        nome: 'Admin',
        funcao: 'ADMIN',
      });

      expect(resultAdmin).toEqual(mockAssignments);
    });
  });
});
