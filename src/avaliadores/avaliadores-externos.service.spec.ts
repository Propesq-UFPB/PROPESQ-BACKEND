import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { TipoAvaliador } from '@prisma/client';
import { AvaliadoresExternosService } from './avaliadores-externos.service';
import { AvaliadoresService } from './avaliadores.service';
import { PrismaService } from '../prisma/prisma.service';
import { hashToken } from '../acesso-externo/token';

const tx = {
  usuario: { create: jest.fn() },
  avaliador: { create: jest.fn() },
};

const prisma = {
  $transaction: jest.fn(),
  usuario: { findFirst: jest.fn(), update: jest.fn() },
  funcao: { findUnique: jest.fn() },
  avaliador: { findFirst: jest.fn() },
  avaliador_externo: { update: jest.fn() },
  avaliador_acesso: { updateMany: jest.fn(), create: jest.fn() },
};

const avaliadores = {
  normalizarAdicionais: jest.fn((principal: number, adicionais: number[] = []) =>
    adicionais.filter(id => id !== principal),
  ),
  assertAreasExistem: jest.fn(),
  update: jest.fn(),
  toResponseDto: jest.fn((row: { id: number }) => ({ id: row.id })),
};

const dto = {
  nome: 'Ana Souza',
  email: 'ana@ufpe.br',
  instituicao: 'UFPE',
  area_principal_id: 100,
  areas_adicionais_ids: [101, 100],
};

describe('AvaliadoresExternosService', () => {
  const service = new AvaliadoresExternosService(
    prisma as unknown as PrismaService,
    avaliadores as unknown as AvaliadoresService,
  );

  beforeEach(() => {
    prisma.$transaction.mockImplementation((arg: unknown) =>
      typeof arg === 'function'
        ? Promise.resolve((arg as (t: typeof tx) => unknown)(tx))
        : Promise.all(arg as unknown[]),
    );
    prisma.funcao.findUnique.mockResolvedValue({ id: 99 });
    prisma.usuario.findFirst.mockResolvedValue(null);
    tx.usuario.create.mockResolvedValue({ id: 50 });
    tx.avaliador.create.mockResolvedValue({ id: 7 });
    prisma.avaliador.findFirst.mockResolvedValue({
      id: 7,
      usuario_id: 50,
      usuario: { email: 'ana@ufpe.br' },
      acessos: [],
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('cria o usuário de sistema, o cadastro EXTERNO e um link guardando só o hash', async () => {
      const result = await service.create(dto);

      const [[usuarioArgs]] = tx.usuario.create.mock.calls as [[{ data: Record<string, unknown> }]];
      expect(usuarioArgs.data).toMatchObject({
        nome: 'Ana Souza',
        email: 'ana@ufpe.br',
        funcao_id: 99,
      });
      expect(usuarioArgs.data.senha).toEqual(expect.stringMatching(/^[A-Za-z0-9_-]{64}$/));

      const [[{ data }]] = tx.avaliador.create.mock.calls as [
        [{ data: { acessos: { create: unknown } } & Record<string, unknown> }],
      ];
      expect(data).toMatchObject({
        usuario_id: 50,
        tipo: TipoAvaliador.EXTERNO,
        area_principal_id: 100,
        areas_adicionais: { create: [{ area_conhecimento_id: 101 }] },
        externo: { create: { instituicao: 'UFPE' } },
      });

      const token = result.link.url.split('/avaliacao-externa/')[1];
      expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(data.acessos.create).toEqual({ token_hash: hashToken(token), expira_em: null });
      expect(JSON.stringify(data)).not.toContain(token);
      expect(result.avaliador).toMatchObject({ id: 7, link: { ativo: false } });
    });

    it('recusa e-mail de usuário do sistema, sugerindo o cadastro interno', async () => {
      prisma.usuario.findFirst.mockResolvedValue({ id: 3, funcao: { nome: 'COORDENADOR' } });
      await expect(service.create(dto)).rejects.toThrow(/avaliador interno/);
      expect(tx.usuario.create).not.toHaveBeenCalled();
    });

    it('recusa e-mail de outro avaliador externo', async () => {
      prisma.usuario.findFirst.mockResolvedValue({ id: 4, funcao: { nome: 'AVALIADOR_EXTERNO' } });
      await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    });

    it('recusa validade de link no passado', async () => {
      await expect(
        service.create({ ...dto, link_expira_em: '2020-01-01T00:00:00Z' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('informa se o link mais recente ainda vale', async () => {
      const criado = new Date();
      prisma.avaliador.findFirst.mockResolvedValue({
        id: 7,
        acessos: [
          { criado_em: criado, expira_em: null, revogado_em: null, ultimo_acesso_em: null },
        ],
      });

      expect(await service.findOne(7)).toMatchObject({
        link: { ativo: true, criado_em: criado, expira_em: null, ultimo_acesso_em: null },
      });
    });

    it('só encontra avaliadores EXTERNO', async () => {
      prisma.avaliador.findFirst.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.avaliador.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1, tipo: TipoAvaliador.EXTERNO } }),
      );
    });
  });

  describe('links', () => {
    it('gerar um novo link revoga os anteriores', async () => {
      const link = await service.gerarLink(7, '2099-01-01T00:00:00Z');

      expect(prisma.avaliador_acesso.updateMany).toHaveBeenCalledWith({
        where: { avaliador_id: 7, revogado_em: null },
        data: { revogado_em: expect.any(Date) as Date },
      });
      const token = link.url.split('/avaliacao-externa/')[1];
      expect(prisma.avaliador_acesso.create).toHaveBeenCalledWith({
        data: {
          avaliador_id: 7,
          token_hash: hashToken(token),
          expira_em: new Date('2099-01-01T00:00:00Z'),
        },
      });
    });

    it('revogar sem link válido responde 404', async () => {
      prisma.avaliador_acesso.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.revogarLink(7)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('repassa áreas e flags ao cadastro comum e grava nome, e-mail e filiação', async () => {
      await service.update(7, { area_principal_id: 102, nome: 'Ana S.', instituicao: 'UFRN' });

      expect(avaliadores.update).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ area_principal_id: 102 }),
      );
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 50 },
        data: { nome: 'Ana S.', email: undefined },
      });
      expect(prisma.avaliador_externo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { avaliador_id: 7 },
          data: expect.objectContaining({ instituicao: 'UFRN' }) as object,
        }),
      );
    });

    it('não chama o cadastro comum quando só dados externos mudam', async () => {
      await service.update(7, { telefone: '123' });
      expect(avaliadores.update).not.toHaveBeenCalled();
    });
  });
});
