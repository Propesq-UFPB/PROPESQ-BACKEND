import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AvaliadorExternoGuard } from './avaliador-externo.guard';
import { PrismaService } from '../prisma/prisma.service';

const contexto = (user?: object): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  }) as unknown as ExecutionContext;

describe('AvaliadorExternoGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const prisma = { avaliador_acesso: { findFirst: jest.fn() } };
  const guard = new AvaliadorExternoGuard(
    reflector as unknown as Reflector,
    prisma as unknown as PrismaService,
  );
  const externo = { userId: 50, funcao: 'AVALIADOR_EXTERNO', acesso_id: 9 };

  afterEach(() => jest.clearAllMocks());

  it('não interfere em sessões comuns nem em rotas públicas', async () => {
    await expect(guard.canActivate(contexto({ userId: 1, funcao: 'GESTOR' }))).resolves.toBe(true);
    await expect(guard.canActivate(contexto(undefined))).resolves.toBe(true);
    expect(prisma.avaliador_acesso.findFirst).not.toHaveBeenCalled();
  });

  it('recusa a sessão externa em rotas não liberadas', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    await expect(guard.canActivate(contexto(externo))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('libera a rota marcada enquanto o link da sessão for válido', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    prisma.avaliador_acesso.findFirst.mockResolvedValue({ id: 9 });

    await expect(guard.canActivate(contexto(externo))).resolves.toBe(true);

    const [[{ where }]] = prisma.avaliador_acesso.findFirst.mock.calls as [[{ where: object }]];
    expect(where).toMatchObject({
      id: 9,
      revogado_em: null,
      avaliador: { usuario_id: 50, ativo: true },
    });
  });

  it('encerra a sessão quando o link foi revogado, expirou ou o avaliador foi desativado', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    prisma.avaliador_acesso.findFirst.mockResolvedValue(null);

    await expect(guard.canActivate(contexto(externo))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
