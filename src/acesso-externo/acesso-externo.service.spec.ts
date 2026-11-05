import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TipoAvaliador } from '@prisma/client';
import { AcessoExternoService, SESSAO_EXTERNA_SEGUNDOS } from './acesso-externo.service';
import { PrismaService } from '../prisma/prisma.service';
import { hashToken } from './token';

describe('AcessoExternoService', () => {
  const prisma = { avaliador_acesso: { findUnique: jest.fn(), update: jest.fn() } };
  const jwt = { signAsync: jest.fn().mockResolvedValue('jwt') };
  const service = new AcessoExternoService(
    prisma as unknown as PrismaService,
    jwt as unknown as JwtService,
  );

  const acesso = (over: Record<string, unknown> = {}, avaliador: Record<string, unknown> = {}) => ({
    id: 9,
    revogado_em: null,
    expira_em: null,
    ...over,
    avaliador: {
      id: 7,
      ativo: true,
      tipo: TipoAvaliador.EXTERNO,
      usuario: { id: 50, nome: 'Ana', email: 'ana@ufpe.br' },
      externo: { instituicao: 'UFPE' },
      ...avaliador,
    },
  });

  afterEach(() => jest.clearAllMocks());

  it('procura pelo hash do token e abre uma sessão de avaliador externo', async () => {
    prisma.avaliador_acesso.findUnique.mockResolvedValue(acesso());

    const result = await service.abrirSessao('meu-token');

    expect(prisma.avaliador_acesso.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { token_hash: hashToken('meu-token') } }),
    );
    expect(jwt.signAsync).toHaveBeenCalledWith(
      { sub: 50, email: 'ana@ufpe.br', nome: 'Ana', funcao: 'AVALIADOR_EXTERNO', acesso_id: 9 },
      { expiresIn: SESSAO_EXTERNA_SEGUNDOS },
    );
    expect(prisma.avaliador_acesso.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { ultimo_acesso_em: expect.any(Date) as Date },
    });
    expect(result).toEqual({
      accessToken: 'jwt',
      expiresIn: SESSAO_EXTERNA_SEGUNDOS,
      avaliador: { id: 7, nome: 'Ana', email: 'ana@ufpe.br', instituicao: 'UFPE' },
    });
  });

  it.each([
    ['inexistente', null],
    ['revogado', acesso({ revogado_em: new Date() })],
    ['expirado', acesso({ expira_em: new Date(Date.now() - 1000) })],
    ['de avaliador inativo', acesso({}, { ativo: false })],
    ['de avaliador interno', acesso({}, { tipo: TipoAvaliador.INTERNO })],
  ])('recusa link %s com a mesma resposta', async (_caso, row) => {
    prisma.avaliador_acesso.findUnique.mockResolvedValue(row);

    await expect(service.abrirSessao('x')).rejects.toThrow(
      new UnauthorizedException('Link de acesso inválido ou expirado.'),
    );
    expect(jwt.signAsync).not.toHaveBeenCalled();
    expect(prisma.avaliador_acesso.update).not.toHaveBeenCalled();
  });

  it('aceita link com validade futura', async () => {
    prisma.avaliador_acesso.findUnique.mockResolvedValue(
      acesso({ expira_em: new Date(Date.now() + 60_000) }),
    );
    await expect(service.abrirSessao('x')).resolves.toMatchObject({ accessToken: 'jwt' });
  });
});
