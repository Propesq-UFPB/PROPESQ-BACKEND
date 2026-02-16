import { Test, TestingModule } from '@nestjs/testing';
import { WorkPlanService } from './work-plan.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkPlanCreationDto } from './dto/create-work-plan.dto';
import { WorkPlanUpdateDto } from './dto/update-work-plan.dto';

const mockPrismaService = {
  discente: { findUnique: jest.fn() },
  usuario: { findUnique: jest.fn() },
  cronograma: { findUnique: jest.fn() },
  corpo_plano_trabalho: { findUnique: jest.fn() },
  plano_trabalho: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  projeto_pesquisa: { count: jest.fn() },
};

describe('WorkPlanService', () => {
  let service: WorkPlanService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkPlanService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WorkPlanService>(WorkPlanService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: WorkPlanCreationDto = {
      discente_id: 1,
      usuario_id: 1,
      cronograma_id: 1,
      corpo_id: 1,
      modalidade: 'IC',
      status: 'Ativo',
      tipo_bolsa: 'Voluntário',
      direcionamento_plano: 'Pesquisa',
    };

    it('deve criar um plano de trabalho se todas as FKs existirem', async () => {
      prisma.discente.findUnique.mockResolvedValue({ id: 1 });
      prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
      prisma.cronograma.findUnique.mockResolvedValue({ id: 1 });
      prisma.corpo_plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      
      prisma.plano_trabalho.create.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);

      expect(prisma.plano_trabalho.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('deve lançar NotFoundException se o discente não existir', async () => {
      prisma.discente.findUnique.mockResolvedValue(null);
      // Os outros podem retornar algo para isolar o erro
      prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
      prisma.cronograma.findUnique.mockResolvedValue({ id: 1 });
      prisma.corpo_plano_trabalho.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      prisma.discente.findUnique.mockResolvedValue({ id: 1 });
      prisma.usuario.findUnique.mockResolvedValue(null); // Falha aqui
      prisma.cronograma.findUnique.mockResolvedValue({ id: 1 });
      prisma.corpo_plano_trabalho.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se o cronograma não existir', async () => {
      prisma.discente.findUnique.mockResolvedValue({ id: 1 });
      prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
      prisma.cronograma.findUnique.mockResolvedValue(null); // Falha aqui
      prisma.corpo_plano_trabalho.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se o corpo do plano não existir', async () => {
      prisma.discente.findUnique.mockResolvedValue({ id: 1 });
      prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
      prisma.cronograma.findUnique.mockResolvedValue({ id: 1 });
      prisma.corpo_plano_trabalho.findUnique.mockResolvedValue(null); // Falha aqui

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar dados paginados', async () => {
      const mockData = [{ id: 1, status: 'Ativo' }];
      prisma.plano_trabalho.findMany.mockResolvedValue(mockData);
      prisma.plano_trabalho.count.mockResolvedValue(1);

      const result = await service.findAll(10, 0);

      expect(result).toEqual({
        total: 1,
        limit: 10,
        offset: 0,
        results: mockData,
      });
      expect(prisma.plano_trabalho.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 0 })
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um plano se encontrado', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      const result = await service.findOne(1);
      expect(result).toBeDefined();
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: WorkPlanUpdateDto = { status: 'Finalizado' };

    beforeEach(() => {
      // Por padrão, findOne encontra o plano (para focar nos testes de FK)
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
    });

    it('deve atualizar com sucesso', async () => {
      prisma.plano_trabalho.update.mockResolvedValue({ id: 1, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result.status).toBe('Finalizado');
    });

    it('deve validar nova FK de discente se fornecida e não encontrada', async () => {
      prisma.discente.findUnique.mockResolvedValue(null); // Não existe

      await expect(
        service.update(1, { discente_id: 99 })
      ).rejects.toThrow(NotFoundException);
    });

    it('deve validar nova FK de usuario se fornecida e não encontrada', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null); // Não existe

      await expect(
        service.update(1, { usuario_id: 99 })
      ).rejects.toThrow(NotFoundException);
    });

    it('deve validar nova FK de cronograma se fornecida e não encontrada', async () => {
      prisma.cronograma.findUnique.mockResolvedValue(null); // Não existe

      await expect(
        service.update(1, { cronograma_id: 99 })
      ).rejects.toThrow(NotFoundException);
    });

    it('deve validar nova FK de corpo do plano se fornecida e não encontrada', async () => {
      prisma.corpo_plano_trabalho.findUnique.mockResolvedValue(null); // Não existe

      await expect(
        service.update(1, { corpo_id: 99 })
      ).rejects.toThrow(NotFoundException);
    });
    
    // Testes de sucesso para as FKs no update (para cobrir o caminho feliz do if)
    it('deve permitir atualizar FK de usuario se existir', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 2 });
      prisma.plano_trabalho.update.mockResolvedValue({ id: 1, usuario_id: 2 });
      
      await service.update(1, { usuario_id: 2 });
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
    });
  });

  describe('remove', () => {
    it('deve remover se não houver projetos vinculados', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.projeto_pesquisa.count.mockResolvedValue(0);
      prisma.plano_trabalho.delete.mockResolvedValue({ id: 1 });

      await service.remove(1);
      expect(prisma.plano_trabalho.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });

    it('deve lançar BadRequestException se houver projetos vinculados', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.projeto_pesquisa.count.mockResolvedValue(2);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
      expect(prisma.plano_trabalho.delete).not.toHaveBeenCalled();
    });
  });
});
