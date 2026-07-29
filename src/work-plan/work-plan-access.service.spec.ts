import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { WorkPlanAccessService } from './work-plan-access.service';

const mockPrisma = {
  membro_projeto: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  plano_trabalho: {
    findUnique: jest.fn(),
  },
};

describe('WorkPlanAccessService', () => {
  let service: WorkPlanAccessService;

  const adminUser: CurrentUserPayload = {
    userId: 1,
    email: 'admin@test.com',
    nome: 'Admin',
    funcao: 'ADMIN',
  };

  const gestorUser: CurrentUserPayload = {
    userId: 2,
    email: 'gestor@test.com',
    nome: 'Gestor',
    funcao: 'GESTOR',
  };

  const coordUser: CurrentUserPayload = {
    userId: 10,
    email: 'coord@test.com',
    nome: 'Coord',
    funcao: 'COORDENADOR',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkPlanAccessService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(WorkPlanAccessService);
    jest.clearAllMocks();
  });

  describe('buildScopeWhere', () => {
    it('ADMIN não aplica filtro por membro', async () => {
      const where = await service.buildScopeWhere(adminUser, { forceMemberScope: true });
      expect(where).toBeUndefined();
      expect(mockPrisma.membro_projeto.findMany).not.toHaveBeenCalled();
    });

    it('GESTOR não aplica filtro por membro', async () => {
      const where = await service.buildScopeWhere(gestorUser, { forceMemberScope: true });
      expect(where).toBeUndefined();
    });

    it('COORDENADOR com forceMemberScope filtra por projetos permitidos', async () => {
      mockPrisma.membro_projeto.findMany.mockResolvedValue([
        {
          projeto_pesquisa_id: 100,
          funcao_projeto: { nome: 'Orientador' },
          projeto_pesquisa: { id: 100, edital_rel: { apenas_orient_coordena_plano: false } },
        },
        {
          projeto_pesquisa_id: 200,
          funcao_projeto: { nome: 'Coordenador' },
          projeto_pesquisa: { id: 200, edital_rel: { apenas_orient_coordena_plano: false } },
        },
      ]);

      const where = await service.buildScopeWhere(coordUser, { forceMemberScope: true });
      expect(where).toEqual({ pesquisa_id: { in: [100, 200] } });
    });

    it('apenas_orient_coordena_plano bloqueia Coordenador e mantém Orientador', async () => {
      mockPrisma.membro_projeto.findMany.mockResolvedValue([
        {
          projeto_pesquisa_id: 100,
          funcao_projeto: { nome: 'Coordenador' },
          projeto_pesquisa: { id: 100, edital_rel: { apenas_orient_coordena_plano: true } },
        },
        {
          projeto_pesquisa_id: 200,
          funcao_projeto: { nome: 'Orientador' },
          projeto_pesquisa: { id: 200, edital_rel: { apenas_orient_coordena_plano: true } },
        },
      ]);

      const where = await service.buildScopeWhere(coordUser, { forceMemberScope: true });
      expect(where).toEqual({ pesquisa_id: { in: [200] } });
    });

    it('não inclui Coorientador (query só pede funções de indicação)', async () => {
      mockPrisma.membro_projeto.findMany.mockResolvedValue([]);

      await service.buildScopeWhere(coordUser, { forceMemberScope: true });

      expect(mockPrisma.membro_projeto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            funcao_projeto: {
              nome: { in: ['Orientador', 'Coordenador', 'Coordenador Adjunto'] },
            },
          }),
        }),
      );
    });

    it('sem membros retorna pesquisa_id in []', async () => {
      mockPrisma.membro_projeto.findMany.mockResolvedValue([]);
      const where = await service.buildScopeWhere(coordUser, { forceMemberScope: true });
      expect(where).toEqual({ pesquisa_id: { in: [] } });
    });
  });

  describe('assertCanAccessPlan', () => {
    it('404 se plano não existe', async () => {
      mockPrisma.plano_trabalho.findUnique.mockResolvedValue(null);
      await expect(
        service.assertCanAccessPlan(coordUser, 99, { forceMemberScope: true }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('ADMIN passa sem checar membro', async () => {
      mockPrisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        pesquisa_id: 10,
        projeto_pesquisa: { edital_rel: null },
      });

      await expect(
        service.assertCanAccessPlan(adminUser, 1, { forceMemberScope: true }),
      ).resolves.toBeUndefined();
      expect(mockPrisma.membro_projeto.findFirst).not.toHaveBeenCalled();
    });

    it('403 se COORDENADOR sem membership', async () => {
      mockPrisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        pesquisa_id: 10,
        projeto_pesquisa: { edital_rel: { apenas_orient_coordena_plano: false } },
      });
      mockPrisma.membro_projeto.findFirst.mockResolvedValue(null);

      await expect(
        service.assertCanAccessPlan(coordUser, 1, { forceMemberScope: true }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('permite Orientador quando apenas_orient_coordena_plano', async () => {
      mockPrisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        pesquisa_id: 10,
        projeto_pesquisa: { edital_rel: { apenas_orient_coordena_plano: true } },
      });
      mockPrisma.membro_projeto.findFirst.mockResolvedValue({ id: 5 });

      await expect(
        service.assertCanAccessPlan(coordUser, 1, { forceMemberScope: true }),
      ).resolves.toBeUndefined();

      expect(mockPrisma.membro_projeto.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            funcao_projeto: { nome: { in: ['Orientador'] } },
          }),
        }),
      );
    });
  });
});
