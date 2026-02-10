import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const mockPrismaService = {
  funcao: {
    findUnique: jest.fn(),
  },
  usuario: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      nome: 'Teste',
      email: 'teste@email.com',
      senha: '123',
      funcao_id: 1,
    };

    it('deve criar um usuário se a função existir', async () => {
      prisma.funcao.findUnique.mockResolvedValue({ id: 1, nome: 'Admin' });
      prisma.usuario.create.mockResolvedValue({ id: 1, ...createUserDto });

      const result = await service.create(createUserDto);

      expect(prisma.funcao.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.usuario.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          criado_em: expect.any(Date),
          atualizado_em: expect.any(Date),
        },
      });
      expect(result).toHaveProperty('id');
    });

    it('deve lançar NotFoundException se a função não existir', async () => {
      prisma.funcao.findUnique.mockResolvedValue(null);

      await expect(service.create(createUserDto)).rejects.toThrow(NotFoundException);
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar resultados paginados', async () => {
      const mockUsers = [{ id: 1, nome: 'User 1' }];
      const total = 1;
      
      prisma.usuario.findMany.mockResolvedValue(mockUsers);
      prisma.usuario.count.mockResolvedValue(total);

      const result = await service.findAll(10, 0);

      expect(prisma.usuario.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { criado_em: 'desc' },
        include: { funcao: true },
      });
      expect(result).toEqual({
        total,
        limit: 10,
        offset: 0,
        results: mockUsers,
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário se encontrado', async () => {
      const mockUser = { id: 1, nome: 'Teste' };
      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = { nome: 'Novo Nome' };

    it('deve atualizar um usuário existente', async () => {
      // Mock do findOne (verificação de existência)
      prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
      // Mock do update
      prisma.usuario.update.mockResolvedValue({ id: 1, nome: 'Novo Nome' });

      const result = await service.update(1, updateDto);

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ...updateDto, atualizado_em: expect.any(Date) },
        include: { funcao: true },
      });
      expect(result.nome).toBe('Novo Nome');
    });

    it('deve falhar se o usuário não existir (via findOne)', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null); // findOne falha primeiro

      await expect(service.update(99, updateDto)).rejects.toThrow(NotFoundException);
      expect(prisma.usuario.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um usuário existente', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
      prisma.usuario.delete.mockResolvedValue({ id: 1 });

      await service.remove(1);

      expect(prisma.usuario.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { funcao: true },
      });
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuário por email', async () => {
      const mockUser = { id: 1, email: 'a@a.com' };
      prisma.usuario.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByEmail('a@a.com');
      expect(result).toEqual(mockUser);
    });

    it('deve lançar exceção se email não existir', async () => {
      prisma.usuario.findFirst.mockResolvedValue(null);
      await expect(service.findByEmail('b@b.com')).rejects.toThrow(NotFoundException);
    });
  });
});
