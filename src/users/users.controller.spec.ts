import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar o service.create', async () => {
      const dto = new CreateUserDto();
      mockUsersService.create.mockResolvedValue({ id: 1, ...dto });

      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll com valores padrão', async () => {
      mockUsersService.findAll.mockResolvedValue({ results: [], total: 0 });

      // Chamada sem argumentos (usa defaults do controller)
      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(10, 0);
    });

    it('deve chamar service.findAll com valores convertidos', async () => {
      mockUsersService.findAll.mockResolvedValue({ results: [], total: 0 });

      // Passando strings, como vem da URL
      await controller.findAll('20', '5');

      expect(service.findAll).toHaveBeenCalledWith(20, 5);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne convertendo ID', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: 1 });

      await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('deve chamar service.update', async () => {
      const dto = new UpdateUserDto();
      mockUsersService.update.mockResolvedValue({ id: 1 });

      await controller.update('1', dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove', async () => {
      mockUsersService.remove.mockResolvedValue({ id: 1 });

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
