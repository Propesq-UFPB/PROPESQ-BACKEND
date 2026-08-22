import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { ProjectMembershipScopeService } from '../common/project-membership-scope.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkPlanAccessService } from './work-plan-access.service';

const mockMembership = {
  isAdminOrGestor: jest.fn(),
  isCoordenador: jest.fn(),
  buildAllowedPesquisaIds: jest.fn(),
  assertCanAccessPesquisa: jest.fn(),
};

const mockPrisma = {
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
        { provide: ProjectMembershipScopeService, useValue: mockMembership },
      ],
    }).compile();

    service = module.get(WorkPlanAccessService);
    jest.clearAllMocks();
  });

  describe('buildScopeWhere', () => {
    it('retorna undefined quando membership não restringe', async () => {
      mockMembership.buildAllowedPesquisaIds.mockResolvedValue(null);
      const where = await service.buildScopeWhere(adminUser);
      expect(where).toBeUndefined();
    });

    it('mapeia ids para pesquisa_id in', async () => {
      mockMembership.buildAllowedPesquisaIds.mockResolvedValue([100, 200]);
      const where = await service.buildScopeWhere(coordUser, { forceMemberScope: true });
      expect(where).toEqual({ pesquisa_id: { in: [100, 200] } });
    });

    it('lista vazia vira pesquisa_id in []', async () => {
      mockMembership.buildAllowedPesquisaIds.mockResolvedValue([]);
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

    it('delega assertCanAccessPesquisa', async () => {
      mockPrisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        pesquisa_id: 10,
      });
      mockMembership.assertCanAccessPesquisa.mockResolvedValue(undefined);

      await service.assertCanAccessPlan(coordUser, 1, { forceMemberScope: true });

      expect(mockMembership.assertCanAccessPesquisa).toHaveBeenCalledWith(coordUser, 10, {
        forceMemberScope: true,
      });
    });
  });
});

describe('ProjectMembershipScopeService', () => {
  let service: ProjectMembershipScopeService;

  const mockPrismaFull = {
    membro_projeto: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    projeto_pesquisa: {
      findUnique: jest.fn(),
    },
  };

  const adminUser: CurrentUserPayload = {
    userId: 1,
    email: 'admin@test.com',
    nome: 'Admin',
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
        ProjectMembershipScopeService,
        { provide: PrismaService, useValue: mockPrismaFull },
      ],
    }).compile();

    service = module.get(ProjectMembershipScopeService);
    jest.clearAllMocks();
  });

  describe('buildAllowedPesquisaIds', () => {
    it('GESTOR retorna null', async () => {
      const ids = await service.buildAllowedPesquisaIds(adminUser, { forceMemberScope: true });
      expect(ids).toBeNull();
    });

    it('COORDENADOR filtra projetos permitidos', async () => {
      mockPrismaFull.membro_projeto.findMany.mockResolvedValue([
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

      const ids = await service.buildAllowedPesquisaIds(coordUser, { forceMemberScope: true });
      expect(ids).toEqual([100, 200]);
    });

    it('apenas_orient_coordena_plano bloqueia Coordenador', async () => {
      mockPrismaFull.membro_projeto.findMany.mockResolvedValue([
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

      const ids = await service.buildAllowedPesquisaIds(coordUser, { forceMemberScope: true });
      expect(ids).toEqual([200]);
    });

    it('não inclui Coorientador na query', async () => {
      mockPrismaFull.membro_projeto.findMany.mockResolvedValue([]);
      await service.buildAllowedPesquisaIds(coordUser, { forceMemberScope: true });
      expect(mockPrismaFull.membro_projeto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            funcao_projeto: {
              nome: { in: ['Orientador', 'Coordenador', 'Coordenador Adjunto'] },
            },
          }),
        }),
      );
    });
  });

  describe('assertCanAccessPesquisa', () => {
    it('404 se projeto não existe', async () => {
      mockPrismaFull.projeto_pesquisa.findUnique.mockResolvedValue(null);
      await expect(
        service.assertCanAccessPesquisa(coordUser, 99, { forceMemberScope: true }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('GESTOR passa', async () => {
      mockPrismaFull.projeto_pesquisa.findUnique.mockResolvedValue({
        id: 1,
        edital_rel: null,
      });
      await expect(
        service.assertCanAccessPesquisa(adminUser, 1, { forceMemberScope: true }),
      ).resolves.toBeUndefined();
    });

    it('403 sem membership', async () => {
      mockPrismaFull.projeto_pesquisa.findUnique.mockResolvedValue({
        id: 1,
        edital_rel: { apenas_orient_coordena_plano: false },
      });
      mockPrismaFull.membro_projeto.findFirst.mockResolvedValue(null);

      await expect(
        service.assertCanAccessPesquisa(coordUser, 1, { forceMemberScope: true }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
