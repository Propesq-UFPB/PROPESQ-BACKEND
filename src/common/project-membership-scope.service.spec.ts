import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectMembershipScopeService } from './project-membership-scope.service';

describe('Escopo obrigatório de gestor para cadastro de planos', () => {
  const user = { userId: 3, email: 'gestor@test.com', nome: 'Gestor', funcao: 'GESTOR' };
  const options = { forceMemberScope: true, requireGestorMembership: true };
  const db = {
    projeto_pesquisa: { findUnique: jest.fn() },
    membro_projeto: { findMany: jest.fn(), findFirst: jest.fn() },
    projeto_membro: { findMany: jest.fn(), findFirst: jest.fn() },
  };
  const service = new ProjectMembershipScopeService(db as unknown as PrismaService);
  beforeEach(() => {
    jest.resetAllMocks();
    db.projeto_pesquisa.findUnique.mockResolvedValue({ id: 1 });
    db.membro_projeto.findMany.mockResolvedValue([]);
    db.projeto_membro.findMany.mockResolvedValue([]);
  });
  it('mantém acesso administrativo nas operações que não exigem vínculo', async () => {
    expect(await service.buildAllowedPesquisaIds(user)).toBeNull();
    await expect(service.assertCanAccessPesquisa(user, 1)).resolves.toBeUndefined();
  });
  it('lista vazia e erro 403 para gestor sem vínculo no cadastro', async () => {
    expect(await service.buildAllowedPesquisaIds(user, options)).toEqual([]);
    await expect(service.assertCanAccessPesquisa(user, 1, options)).rejects.toThrow(ForbiddenException);
  });
  it('permite gestor coordenador do projeto', async () => {
    db.projeto_membro.findMany.mockResolvedValue([{ projeto_id: 1, funcao: 'COORDENADOR', projeto_pesquisa: {} }]);
    db.projeto_membro.findFirst.mockResolvedValue({ projeto_id: 1 });
    expect(await service.buildAllowedPesquisaIds(user, options)).toEqual([1]);
    await expect(service.assertCanAccessPesquisa(user, 1, options)).resolves.toBeUndefined();
  });
});
