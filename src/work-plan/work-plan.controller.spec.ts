import { Test, TestingModule } from '@nestjs/testing';
import { WorkPlanController } from './work-plan.controller';
import { WorkPlanService } from './work-plan.service';
import { WorkPlanCreationDto } from './dto/create-work-plan.dto';
import { WorkPlanUpdateDto } from './dto/update-work-plan.dto';

const mockWorkPlanService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('WorkPlanController', () => {
  let controller: WorkPlanController;
  let service: WorkPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkPlanController],
      providers: [
        {
          provide: WorkPlanService,
          useValue: mockWorkPlanService,
        },
      ],
    }).compile();

    controller = module.get<WorkPlanController>(WorkPlanController);
    service = module.get<WorkPlanService>(WorkPlanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar service.create', async () => {
      const dto = new WorkPlanCreationDto();
      mockWorkPlanService.create.mockResolvedValue({ id: 1, ...dto });

      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll com conversão de tipos', async () => {
      mockWorkPlanService.findAll.mockResolvedValue({ results: [], total: 0 });

      await controller.findAll('20', '5');
      expect(service.findAll).toHaveBeenCalledWith(20, 5);
    });

    it('deve usar valores padrão se query params vazios', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalledWith(10, 0);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne com conversão de ID', async () => {
      mockWorkPlanService.findOne.mockResolvedValue({ id: 1 });

      await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('deve chamar service.update', async () => {
      const dto = new WorkPlanUpdateDto();
      mockWorkPlanService.update.mockResolvedValue({ id: 1 });

      await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove', async () => {
      mockWorkPlanService.remove.mockResolvedValue({ id: 1 });

      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});