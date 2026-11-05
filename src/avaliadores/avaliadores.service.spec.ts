import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AvaliadoresService } from './avaliadores.service';
import { PrismaService } from '../prisma/prisma.service';

const txMock = {
  avaliador_area_adicional: { deleteMany: jest.fn() },
  avaliador: { update: jest.fn(), upsert: jest.fn() },
};

const prismaMock = {
  avaliador: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  usuario: { findUnique: jest.fn(), findMany: jest.fn() },
  area_conhecimento: { findMany: jest.fn() },
  edital: { findUnique: jest.fn() },
  edital_avaliador: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  projeto_avaliacao: { count: jest.fn(), findMany: jest.fn(), groupBy: jest.fn() },
  $transaction: jest.fn(),
};

const area = (id: number) => ({
  id,
  grande_area: 'G',
  area: 'A',
  sub_area: `S${id}`,
  especialidade: '',
});

const avaliadorRow = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  usuario_id: 10,
  area_principal_id: 100,
  is_propesq: false,
  is_voluntario: false,
  is_cnpq: false,
  ativo: true,
  areas_atualizadas_em: new Date('2026-10-15'),
  criado_em: new Date('2026-10-15'),
  atualizado_em: new Date('2026-10-15'),
  usuario: { id: 10, nome: 'Maria', email: 'maria@exemplo.com' },
  area_principal: area(100),
  areas_adicionais: [{ area_conhecimento: area(101) }],
  ...overrides,
});

describe('AvaliadoresService', () => {
  let service: AvaliadoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvaliadoresService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get(AvaliadoresService);

    prismaMock.usuario.findUnique.mockResolvedValue({
      funcao: { nome: 'COORDENADOR' },
      docente: [],
    });
    prismaMock.avaliador.findUnique.mockResolvedValue(null);
    prismaMock.area_conhecimento.findMany.mockImplementation(
      ({ where }: { where: { id: { in: number[] } } }) =>
        Promise.resolve(where.id.in.map(id => ({ id }))),
    );
    prismaMock.edital.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.projeto_avaliacao.groupBy.mockResolvedValue([]);
    prismaMock.projeto_avaliacao.findMany.mockResolvedValue([]);
    prismaMock.$transaction.mockImplementation((arg: unknown) =>
      typeof arg === 'function'
        ? (arg as (tx: typeof txMock) => unknown)(txMock)
        : Promise.all(arg as unknown[]),
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    const dto = { usuario_id: 10, area_principal_id: 100, areas_adicionais_ids: [101, 100, 101] };

    it('creates the avaliador deduplicating additional areas and removing the main one', async () => {
      prismaMock.avaliador.create.mockResolvedValue(avaliadorRow());

      const result = await service.create(dto);

      const [[{ data }]] = prismaMock.avaliador.create.mock.calls as [[{ data: object }]];
      expect(data).toMatchObject({
        usuario_id: 10,
        area_principal_id: 100,
        ativo: true,
        areas_atualizadas_em: expect.any(Date),
        areas_adicionais: { create: [{ area_conhecimento_id: 101 }] },
      });
      expect(result).toMatchObject({
        id: 1,
        usuario: { nome: 'Maria' },
        area_principal: { id: 100 },
        areas_adicionais: [{ id: 101 }],
      });
    });

    it('uses the docente knowledge area when area_principal_id is omitted', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        funcao: { nome: 'COORDENADOR' },
        docente: [{ area_conhecimento: area(200) }],
      });
      prismaMock.avaliador.create.mockResolvedValue(avaliadorRow());

      await service.create({ usuario_id: 10 });

      const [[{ data }]] = prismaMock.avaliador.create.mock.calls as [[{ data: object }]];
      expect(data).toMatchObject({ area_principal_id: 200 });
    });

    it('prefers the informed area over the docente one', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        funcao: { nome: 'COORDENADOR' },
        docente: [{ area_conhecimento: area(200) }],
      });
      prismaMock.avaliador.create.mockResolvedValue(avaliadorRow());

      await service.create({ usuario_id: 10, area_principal_id: 100 });

      const [[{ data }]] = prismaMock.avaliador.create.mock.calls as [[{ data: object }]];
      expect(data).toMatchObject({ area_principal_id: 100 });
    });

    it('requires an area when the user has no docente area', async () => {
      await expect(service.create({ usuario_id: 10 })).rejects.toThrow('Informe a área principal');
      expect(prismaMock.avaliador.create).not.toHaveBeenCalled();
    });

    it('rejects users with an ineligible role', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({ funcao: { nome: 'ALUNO' }, docente: [] });
      await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFound for unknown users', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects users that are already avaliadores', async () => {
      prismaMock.avaliador.findUnique.mockResolvedValue({ id: 5 });
      await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects unknown knowledge areas', async () => {
      prismaMock.area_conhecimento.findMany.mockResolvedValue([{ id: 100 }]);
      await expect(service.create(dto)).rejects.toThrow('101');
      expect(prismaMock.avaliador.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('filters by ativo and search on usuario nome/email', async () => {
      prismaMock.avaliador.count.mockResolvedValue(1);
      prismaMock.avaliador.findMany.mockResolvedValue([avaliadorRow()]);

      const result = await service.findAll(10, 0, true, ' maria ');

      const where = {
        ativo: true,
        usuario: {
          OR: [
            { nome: { contains: 'maria', mode: 'insensitive' } },
            { email: { contains: 'maria', mode: 'insensitive' } },
          ],
        },
      };
      expect(prismaMock.avaliador.count).toHaveBeenCalledWith({ where });
      expect(prismaMock.avaliador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where, take: 10, skip: 0 }),
      );
      expect(result).toMatchObject({ total: 1, limit: 10, offset: 0, results: [{ id: 1 }] });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      prismaMock.avaliador.findUnique.mockResolvedValue(avaliadorRow());
      txMock.avaliador.update.mockResolvedValue(avaliadorRow());
    });

    it('replaces additional areas when provided', async () => {
      await service.update(1, { areas_adicionais_ids: [102, 100] });

      expect(txMock.avaliador_area_adicional.deleteMany).toHaveBeenCalledWith({
        where: { avaliador_id: 1 },
      });
      const [[{ data }]] = txMock.avaliador.update.mock.calls as [[{ data: object }]];
      expect(data).toMatchObject({
        areas_atualizadas_em: expect.any(Date),
        areas_adicionais: { create: [{ area_conhecimento_id: 102 }] },
      });
    });

    it('keeps areas_atualizadas_em when only flags change', async () => {
      await service.update(1, { ativo: false });

      const [[{ data }]] = txMock.avaliador.update.mock.calls as [[{ data: object }]];
      expect(data).not.toHaveProperty('areas_atualizadas_em');
    });

    it('drops the new main area from the additional ones', async () => {
      await service.update(1, { area_principal_id: 101 });

      expect(txMock.avaliador_area_adicional.deleteMany).toHaveBeenCalledWith({
        where: { avaliador_id: 1, area_conhecimento_id: 101 },
      });
    });

    it('throws NotFound for unknown avaliador', async () => {
      prismaMock.avaliador.findUnique.mockResolvedValue(null);
      await expect(service.update(1, { ativo: false })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findMinhasAreas', () => {
    it('reports whether the areas were updated this year', async () => {
      prismaMock.avaliador.findUnique.mockResolvedValue(
        avaliadorRow({ areas_atualizadas_em: new Date() }),
      );

      const result = await service.findMinhasAreas(10);

      expect(result).toMatchObject({
        avaliador_cadastro_id: 1,
        area_principal: { id: 100 },
        areas_adicionais: [{ id: 101 }],
        atualizado_no_ano: true,
      });
    });

    it('suggests the docente area when the user is not a avaliador', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        docente: [{ area_conhecimento: area(200) }],
      });

      const result = await service.findMinhasAreas(10);

      expect(result).toMatchObject({
        avaliador_cadastro_id: null,
        area_principal: null,
        areas_adicionais: [],
        areas_atualizadas_em: null,
        atualizado_no_ano: false,
        area_sugerida: { id: 200 },
      });
    });
  });

  describe('updateMinhasAreas', () => {
    it('upserts the avaliador replacing the additional areas', async () => {
      await service.updateMinhasAreas(10, {
        area_principal_id: 100,
        areas_adicionais_ids: [101, 100],
      });

      expect(txMock.avaliador_area_adicional.deleteMany).toHaveBeenCalledWith({
        where: { avaliador: { usuario_id: 10 } },
      });
      const data = {
        area_principal_id: 100,
        areas_atualizadas_em: expect.any(Date),
        areas_adicionais: { create: [{ area_conhecimento_id: 101 }] },
      };
      expect(txMock.avaliador.upsert).toHaveBeenCalledWith({
        where: { usuario_id: 10 },
        create: { usuario_id: 10, ...data },
        update: data,
      });
    });

    it('rejects ineligible users', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({ funcao: { nome: 'ALUNO' }, docente: [] });
      await expect(
        service.updateMinhasAreas(10, { area_principal_id: 100, areas_adicionais_ids: [] }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(txMock.avaliador.upsert).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    beforeEach(() => prismaMock.avaliador.findUnique.mockResolvedValue(avaliadorRow()));

    it('deletes avaliadores without assignments', async () => {
      prismaMock.projeto_avaliacao.count.mockResolvedValue(0);
      await service.remove(1);
      expect(prismaMock.avaliador.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('only deactivates avaliadores with assignments', async () => {
      prismaMock.projeto_avaliacao.count.mockResolvedValue(3);
      await service.remove(1);
      // Atribuições são contadas pelo usuário do avaliador, não pelo id do cadastro
      expect(prismaMock.projeto_avaliacao.count).toHaveBeenCalledWith({
        where: { avaliador_id: 10 },
      });
      expect(prismaMock.avaliador.delete).not.toHaveBeenCalled();
      expect(prismaMock.avaliador.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ativo: false },
      });
    });
  });

  describe('findUsuariosElegiveis', () => {
    it('lists non-ALUNO users without avaliador, with their docente area', async () => {
      prismaMock.usuario.findMany.mockResolvedValue([
        {
          id: 10,
          nome: 'Maria',
          email: 'm@x.com',
          funcao: { nome: 'COORDENADOR' },
          docente: [{ area_conhecimento: area(200) }],
        },
        { id: 11, nome: 'João', email: 'j@x.com', funcao: { nome: 'GESTOR' }, docente: [] },
      ]);

      const result = await service.findUsuariosElegiveis(undefined, 20);

      expect(prismaMock.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            avaliador: { is: null },
            funcao: { nome: { notIn: ['ALUNO'], mode: 'insensitive' } },
          },
          take: 20,
        }),
      );
      expect(result).toEqual([
        {
          id: 10,
          nome: 'Maria',
          email: 'm@x.com',
          funcao: 'COORDENADOR',
          area_conhecimento: area(200),
        },
        { id: 11, nome: 'João', email: 'j@x.com', funcao: 'GESTOR', area_conhecimento: null },
      ]);
    });
  });

  describe('edital links', () => {
    it('lists linked avaliadores with their load in the edital', async () => {
      prismaMock.edital_avaliador.findMany.mockResolvedValue([
        { criado_em: new Date('2026-10-01'), avaliador: avaliadorRow() },
      ]);
      prismaMock.projeto_avaliacao.groupBy.mockResolvedValue([
        { avaliador_id: 10, _count: { _all: 4 } },
      ]);

      const result = await service.findByEdital(1);

      expect(result).toMatchObject([{ id: 1, carga: 4, vinculado_em: new Date('2026-10-01') }]);
    });

    it('throws NotFound when the edital does not exist', async () => {
      prismaMock.edital.findUnique.mockResolvedValue(null);
      await expect(service.findByEdital(1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects linking inactive avaliadores', async () => {
      prismaMock.avaliador.findMany.mockResolvedValue([{ id: 1, ativo: false }]);
      await expect(service.addToEdital(1, 1)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects linking an already linked avaliador', async () => {
      prismaMock.avaliador.findMany.mockResolvedValue([{ id: 1, ativo: true }]);
      prismaMock.edital_avaliador.findUnique.mockResolvedValue({ id: 9 });
      await expect(service.addToEdital(1, 1)).rejects.toBeInstanceOf(ConflictException);
    });

    it('does not unlink avaliadores with assignments in the edital', async () => {
      prismaMock.edital_avaliador.findUnique.mockResolvedValue({ id: 9 });
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([
        { avaliador: { avaliador: { id: 1 } } },
      ]);

      await expect(service.removeFromEdital(1, 1)).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.edital_avaliador.delete).not.toHaveBeenCalled();
    });

    it('replaces the linked set adding and removing the difference', async () => {
      prismaMock.edital_avaliador.findMany
        .mockResolvedValueOnce([{ avaliador_id: 1 }, { avaliador_id: 2 }])
        .mockResolvedValueOnce([]);
      prismaMock.avaliador.findMany.mockResolvedValue([{ id: 3, ativo: true }]);

      await service.setEditalAvaliadores(1, [2, 3]);

      expect(prismaMock.edital_avaliador.deleteMany).toHaveBeenCalledWith({
        where: { edital_id: 1, avaliador_id: { in: [1] } },
      });
      expect(prismaMock.edital_avaliador.createMany).toHaveBeenCalledWith({
        data: [{ edital_id: 1, avaliador_id: 3 }],
      });
    });
  });
});
