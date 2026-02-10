import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

// Mock do SchedulesService
const mockSchedulesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SchedulesController', () => {
  let controller: SchedulesController;
  let service: SchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesController],
      providers: [
        {
          provide: SchedulesService,
          useValue: mockSchedulesService,
        },
      ],
    }).compile();

    controller = module.get<SchedulesController>(SchedulesController);
    service = module.get<SchedulesService>(SchedulesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar service.create com os parâmetros corretos', async () => {
      const dto = new CreateScheduleDto();
      mockSchedulesService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll com limit e offset padrão quando não fornecidos', async () => {
      mockSchedulesService.findAll.mockResolvedValue({ results: [], total: 0 });

      await controller.findAll(); // Sem argumentos

      expect(service.findAll).toHaveBeenCalledWith(10, 0); // Defaults do controller
    });

    it('deve chamar service.findAll com limit e offset fornecidos', async () => {
      mockSchedulesService.findAll.mockResolvedValue({ results: [], total: 0 });

      await controller.findAll('20', '5');

      expect(service.findAll).toHaveBeenCalledWith(20, 5);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne com o ID correto', async () => {
      mockSchedulesService.findOne.mockResolvedValue({ id: 1 });

      await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('deve chamar service.update com o ID e DTO corretos', async () => {
      const dto = new UpdateScheduleDto();
      mockSchedulesService.update.mockResolvedValue({ id: 1, ...dto });

      await controller.update('1', dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove com o ID correto', async () => {
      mockSchedulesService.remove.mockResolvedValue({ id: 1 });

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
