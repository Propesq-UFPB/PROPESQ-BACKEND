import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ConsultorService } from './consultor.service';
import { PrismaService } from '../prisma/prisma.service';

const txMock = {
  consultor_area_adicional: { deleteMany: jest.fn() },
  consultor: { update: jest.fn() },
};

const prismaMock = {
  consultor: {
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
  edital_consultor: {
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

const consultorRow = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  usuario_id: 10,
  area_principal_id: 100,
  is_propesq: false,
  is_voluntario: false,
  is_cnpq: false,
  ativo: true,
  criado_em: new Date('2026-10-15'),
  atualizado_em: new Date('2026-10-15'),
  usuario: { id: 10, nome: 'Maria', email: 'maria@exemplo.com' },
  area_principal: area(100),
  areas_adicionais: [{ area_conhecimento: area(101) }],
  ...overrides,
});

describe('ConsultorService', () => {
  let service: ConsultorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsultorService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get(ConsultorService);

    prismaMock.usuario.findUnique.mockResolvedValue({
      funcao: { nome: 'COORDENADOR' },
      docente: [],
    });
    prismaMock.consultor.findUnique.mockResolvedValue(null);
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

    it('creates the consultor deduplicating additional areas and removing the main one', async () => {
      prismaMock.consultor.create.mockResolvedValue(consultorRow());

      const result = await service.create(dto);

      const [[{ data }]] = prismaMock.consultor.create.mock.calls as [[{ data: object }]];
      expect(data).toMatchObject({
        usuario_id: 10,
        area_principal_id: 100,
        ativo: true,
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
      prismaMock.consultor.create.mockResolvedValue(consultorRow());

      await service.create({ usuario_id: 10 });

      const [[{ data }]] = prismaMock.consultor.create.mock.calls as [[{ data: object }]];
      expect(data).toMatchObject({ area_principal_id: 200 });
    });

    it('prefers the informed area over the docente one', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        funcao: { nome: 'COORDENADOR' },
        docente: [{ area_conhecimento: area(200) }],
      });
      prismaMock.consultor.create.mockResolvedValue(consultorRow());

      await service.create({ usuario_id: 10, area_principal_id: 100 });

      const [[{ data }]] = prismaMock.consultor.create.mock.calls as [[{ data: object }]];
      expect(data).toMatchObject({ area_principal_id: 100 });
    });

    it('requires an area when the user has no docente area', async () => {
      await expect(service.create({ usuario_id: 10 })).rejects.toThrow('Informe a área principal');
      expect(prismaMock.consultor.create).not.toHaveBeenCalled();
    });

    it('rejects users with an ineligible role', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({ funcao: { nome: 'ALUNO' }, docente: [] });
      await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFound for unknown users', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects users that are already consultores', async () => {
      prismaMock.consultor.findUnique.mockResolvedValue({ id: 5 });
      await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects unknown knowledge areas', async () => {
      prismaMock.area_conhecimento.findMany.mockResolvedValue([{ id: 100 }]);
      await expect(service.create(dto)).rejects.toThrow('101');
      expect(prismaMock.consultor.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('filters by ativo and search on usuario nome/email', async () => {
      prismaMock.consultor.count.mockResolvedValue(1);
      prismaMock.consultor.findMany.mockResolvedValue([consultorRow()]);

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
      expect(prismaMock.consultor.count).toHaveBeenCalledWith({ where });
      expect(prismaMock.consultor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where, take: 10, skip: 0 }),
      );
      expect(result).toMatchObject({ total: 1, limit: 10, offset: 0, results: [{ id: 1 }] });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      prismaMock.consultor.findUnique.mockResolvedValue(consultorRow());
      txMock.consultor.update.mockResolvedValue(consultorRow());
    });

    it('replaces additional areas when provided', async () => {
      await service.update(1, { areas_adicionais_ids: [102, 100] });

      expect(txMock.consultor_area_adicional.deleteMany).toHaveBeenCalledWith({
        where: { consultor_id: 1 },
      });
      const [[{ data }]] = txMock.consultor.update.mock.calls as [[{ data: object }]];
      expect(data).toMatchObject({
        areas_adicionais: { create: [{ area_conhecimento_id: 102 }] },
      });
    });

    it('drops the new main area from the additional ones', async () => {
      await service.update(1, { area_principal_id: 101 });

      expect(txMock.consultor_area_adicional.deleteMany).toHaveBeenCalledWith({
        where: { consultor_id: 1, area_conhecimento_id: 101 },
      });
    });

    it('throws NotFound for unknown consultor', async () => {
      prismaMock.consultor.findUnique.mockResolvedValue(null);
      await expect(service.update(1, { ativo: false })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    beforeEach(() => prismaMock.consultor.findUnique.mockResolvedValue(consultorRow()));

    it('deletes consultores without assignments', async () => {
      prismaMock.projeto_avaliacao.count.mockResolvedValue(0);
      await service.remove(1);
      expect(prismaMock.consultor.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('only deactivates consultores with assignments', async () => {
      prismaMock.projeto_avaliacao.count.mockResolvedValue(3);
      await service.remove(1);
      expect(prismaMock.consultor.delete).not.toHaveBeenCalled();
      expect(prismaMock.consultor.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ativo: false },
      });
    });
  });

  describe('findUsuariosElegiveis', () => {
    it('lists non-ALUNO users without consultor, with their docente area', async () => {
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
            consultor: { is: null },
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
    it('lists linked consultores with their load in the edital', async () => {
      prismaMock.edital_consultor.findMany.mockResolvedValue([
        { criado_em: new Date('2026-10-01'), consultor: consultorRow() },
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

    it('rejects linking inactive consultores', async () => {
      prismaMock.consultor.findMany.mockResolvedValue([{ id: 1, ativo: false }]);
      await expect(service.addToEdital(1, 1)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects linking an already linked consultor', async () => {
      prismaMock.consultor.findMany.mockResolvedValue([{ id: 1, ativo: true }]);
      prismaMock.edital_consultor.findUnique.mockResolvedValue({ id: 9 });
      await expect(service.addToEdital(1, 1)).rejects.toBeInstanceOf(ConflictException);
    });

    it('does not unlink consultores with assignments in the edital', async () => {
      prismaMock.edital_consultor.findUnique.mockResolvedValue({ id: 9 });
      prismaMock.projeto_avaliacao.findMany.mockResolvedValue([{ consultor_id: 1 }]);

      await expect(service.removeFromEdital(1, 1)).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.edital_consultor.delete).not.toHaveBeenCalled();
    });

    it('replaces the linked set adding and removing the difference', async () => {
      prismaMock.edital_consultor.findMany
        .mockResolvedValueOnce([{ consultor_id: 1 }, { consultor_id: 2 }])
        .mockResolvedValueOnce([]);
      prismaMock.consultor.findMany.mockResolvedValue([{ id: 3, ativo: true }]);

      await service.setEditalConsultores(1, [2, 3]);

      expect(prismaMock.edital_consultor.deleteMany).toHaveBeenCalledWith({
        where: { edital_id: 1, consultor_id: { in: [1] } },
      });
      expect(prismaMock.edital_consultor.createMany).toHaveBeenCalledWith({
        data: [{ edital_id: 1, consultor_id: 3 }],
      });
    });
  });
});
