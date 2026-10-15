import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AvaliadoresService } from './avaliadores.service';

const mockPrismaService = {
  avaliador: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  usuario: {
    findUnique: jest.fn(),
  },
  area_conhecimento: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const criarArea = (id: number) => ({
  id,
  grande_area: 'Grande área',
  area: 'Área',
  sub_area: 'Subárea',
  especialidade: 'Especialidade',
});

const qualquerValor = (): unknown => expect.anything();
const contendo = (parcial: Record<string, unknown>): unknown => expect.objectContaining(parcial);

const criarAvaliadorDoBanco = () => ({
  id: 1,
  usuario_id: 7,
  area_conhecimento_principal_id: 101,
  ativo: true,
  is_propesq: false,
  is_voluntario: false,
  criado_em: new Date('2026-10-14T10:00:00.000Z'),
  atualizado_em: new Date('2026-10-14T10:00:00.000Z'),
  usuario: { id: 7, nome: 'Ana Souza', email: 'ana@exemplo.com' },
  area_principal: criarArea(101),
  areas_adicionais: [
    { id: 1, avaliador_id: 1, area_conhecimento_id: 102, area_conhecimento: criarArea(102) },
  ],
});

describe('AvaliadoresService', () => {
  let service: AvaliadoresService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    jest.resetAllMocks();
    // O findAll usa $transaction([...]): o mock precisa executar a lista recebida.
    mockPrismaService.$transaction.mockImplementation((operacoes: Promise<unknown>[]) =>
      Promise.all(operacoes),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [AvaliadoresService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<AvaliadoresService>(AvaliadoresService);
    prisma = module.get(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const prepararCadastroValido = () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 7, avaliador: null });
      prisma.area_conhecimento.findMany.mockResolvedValue([{ id: 101 }, { id: 102 }]);
      prisma.avaliador.create.mockResolvedValue(criarAvaliadorDoBanco());
    };

    it('deve lançar BadRequestException quando a área principal estiver entre as adicionais', async () => {
      await expect(
        service.create({
          usuario_id: 7,
          area_conhecimento_principal_id: 101,
          areas_adicionais_ids: [101, 102],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.usuario.findUnique).not.toHaveBeenCalled();
      expect(prisma.avaliador.create).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ usuario_id: 999, area_conhecimento_principal_id: 101 }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.avaliador.create).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException quando o usuário já for avaliador', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 7, avaliador: { id: 3 } });

      await expect(
        service.create({ usuario_id: 7, area_conhecimento_principal_id: 101 }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.avaliador.create).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException listando as áreas que não existem', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 7, avaliador: null });
      prisma.area_conhecimento.findMany.mockResolvedValue([{ id: 101 }]);

      await expect(
        service.create({
          usuario_id: 7,
          area_conhecimento_principal_id: 101,
          areas_adicionais_ids: [102],
        }),
      ).rejects.toThrow('102');
      expect(prisma.avaliador.create).not.toHaveBeenCalled();
    });

    it('deve gravar com os valores padrão e as áreas adicionais na mesma operação', async () => {
      prepararCadastroValido();

      const result = await service.create({
        usuario_id: 7,
        area_conhecimento_principal_id: 101,
        areas_adicionais_ids: [102],
      });

      expect(prisma.avaliador.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            usuario_id: 7,
            area_conhecimento_principal_id: 101,
            ativo: true,
            is_propesq: false,
            is_voluntario: false,
            areas_adicionais: { create: [{ area_conhecimento_id: 102 }] },
          },
        }),
      );
      expect(result.id).toBe(1);
      expect(result.usuario).toEqual({ id: 7, nome: 'Ana Souza', email: 'ana@exemplo.com' });
      expect(result.area_principal).toEqual(criarArea(101));
      expect(result.areas_adicionais).toEqual([criarArea(102)]);
      expect(result.atualizado_em).toBe('2026-10-14T10:00:00.000Z');
    });

    it('deve respeitar ativo: false enviado de propósito (não trocar por true)', async () => {
      prepararCadastroValido();

      await service.create({
        usuario_id: 7,
        area_conhecimento_principal_id: 101,
        areas_adicionais_ids: [102],
        ativo: false,
      });

      expect(prisma.avaliador.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            ativo: false,
          }),
        }),
      );
    });

    it('deve converter o erro P2002 do banco em ConflictException', async () => {
      prepararCadastroValido();
      prisma.avaliador.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'teste',
        }),
      );

      await expect(
        service.create({
          usuario_id: 7,
          area_conhecimento_principal_id: 101,
          areas_adicionais_ids: [102],
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deve devolver { total, limit, offset, results } com os padrões 20 e 0', async () => {
      prisma.avaliador.findMany.mockResolvedValue([criarAvaliadorDoBanco()]);
      prisma.avaliador.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result.total).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].usuario.nome).toBe('Ana Souza');
      expect(prisma.avaliador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20, skip: 0 }),
      );
    });

    it('deve traduzir os filtros para o where, usando o mesmo where na contagem', async () => {
      prisma.avaliador.findMany.mockResolvedValue([]);
      prisma.avaliador.count.mockResolvedValue(0);

      await service.findAll({
        is_propesq: false,
        area_principal_id: 101,
        area_adicional_id: 102,
        limit: 5,
        offset: 10,
      });

      const where = {
        is_propesq: false,
        area_conhecimento_principal_id: 101,
        areas_adicionais: { some: { area_conhecimento_id: 102 } },
      };
      expect(prisma.avaliador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where, take: 5, skip: 10 }),
      );
      expect(prisma.avaliador.count).toHaveBeenCalledWith({ where });
    });

    it('deve buscar o usuário só com id, nome e email (nunca a senha)', async () => {
      prisma.avaliador.findMany.mockResolvedValue([]);
      prisma.avaliador.count.mockResolvedValue(0);

      await service.findAll({});

      expect(prisma.avaliador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: contendo({ usuario: { select: { id: true, nome: true, email: true } } }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('deve lançar NotFoundException quando o avaliador não existir', async () => {
      prisma.avaliador.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('deve devolver o avaliador no formato de resposta', async () => {
      prisma.avaliador.findUnique.mockResolvedValue(criarAvaliadorDoBanco());

      const result = await service.findOne(1);

      expect(prisma.avaliador.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
      expect(result.id).toBe(1);
      expect(result.areas_adicionais).toEqual([criarArea(102)]);
    });
  });

  describe('update', () => {
    const prepararAvaliadorExistente = () => {
      prisma.avaliador.findUnique.mockResolvedValue({
        id: 1,
        area_conhecimento_principal_id: 101,
        areas_adicionais: [{ area_conhecimento_id: 102 }],
      });
      prisma.avaliador.update.mockResolvedValue(criarAvaliadorDoBanco());
    };

    it('deve lançar NotFoundException quando o avaliador não existir', async () => {
      prisma.avaliador.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { ativo: false })).rejects.toThrow(NotFoundException);
      expect(prisma.avaliador.update).not.toHaveBeenCalled();
    });

    it('deve validar com os valores finais: principal nova igual a uma adicional já gravada', async () => {
      prepararAvaliadorExistente();

      await expect(service.update(1, { area_conhecimento_principal_id: 102 })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.avaliador.update).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando o pedido repetir a principal nas adicionais', async () => {
      prepararAvaliadorExistente();

      await expect(
        service.update(1, { area_conhecimento_principal_id: 103, areas_adicionais_ids: [103] }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.avaliador.update).not.toHaveBeenCalled();
    });

    it('não deve mexer nas áreas adicionais quando areas_adicionais_ids não for enviado', async () => {
      prepararAvaliadorExistente();

      await service.update(1, { ativo: false });

      expect(prisma.avaliador.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ativo: false },
        include: qualquerValor(),
      });
      expect(prisma.area_conhecimento.findMany).not.toHaveBeenCalled();
    });

    it('deve substituir as áreas adicionais quando a lista for enviada', async () => {
      prepararAvaliadorExistente();
      prisma.area_conhecimento.findMany.mockResolvedValue([{ id: 103 }]);

      await service.update(1, { areas_adicionais_ids: [103] });

      expect(prisma.avaliador.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            areas_adicionais: {
              deleteMany: {},
              create: [{ area_conhecimento_id: 103 }],
            },
          },
        }),
      );
    });

    it('deve apagar todas as áreas adicionais quando a lista enviada for vazia', async () => {
      prepararAvaliadorExistente();

      await service.update(1, { areas_adicionais_ids: [] });

      expect(prisma.avaliador.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { areas_adicionais: { deleteMany: {}, create: [] } },
        }),
      );
      expect(prisma.area_conhecimento.findMany).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando uma área nova não existir', async () => {
      prepararAvaliadorExistente();
      prisma.area_conhecimento.findMany.mockResolvedValue([]);

      await expect(service.update(1, { areas_adicionais_ids: [999] })).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.avaliador.update).not.toHaveBeenCalled();
    });
  });
});
