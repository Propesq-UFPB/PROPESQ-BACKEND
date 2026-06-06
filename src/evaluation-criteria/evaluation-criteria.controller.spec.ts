import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationCriteriaController } from './evaluation-criteria.controller';
import { EvaluationCriteriaService } from './evaluation-criteria.service';
import { CreateEvaluationCriterionDto } from './dto/create-evaluation-criterion.dto';
import { UpdateEvaluationCriterionDto } from './dto/update-evaluation-criterion.dto';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  getLookup: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EvaluationCriteriaController', () => {
  let controller: EvaluationCriteriaController;
  let service: EvaluationCriteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationCriteriaController],
      providers: [{ provide: EvaluationCriteriaService, useValue: mockService }],
    }).compile();

    controller = module.get<EvaluationCriteriaController>(EvaluationCriteriaController);
    service = module.get<EvaluationCriteriaService>(EvaluationCriteriaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar service.create', async () => {
      const dto: CreateEvaluationCriterionDto = {
        nome: 'Metodologia',
        peso: 0.3,
        nota_maxima: 10,
      };
      mockService.create.mockResolvedValue({ id: 1, ...dto });

      await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll com valores padrão', async () => {
      mockService.findAll.mockResolvedValue({ results: [], total: 0, limit: 10, offset: 0 });

      await controller.findAll(10, 0, undefined);

      expect(service.findAll).toHaveBeenCalledWith(10, 0, undefined);
    });

    it('deve repassar filtro ativo ao service', async () => {
      mockService.findAll.mockResolvedValue({ results: [], total: 0, limit: 10, offset: 0 });

      await controller.findAll(10, 0, true);

      expect(service.findAll).toHaveBeenCalledWith(10, 0, true);
    });
  });

  describe('getLookup', () => {
    it('deve chamar service.getLookup', async () => {
      mockService.getLookup.mockResolvedValue([]);

      await controller.getLookup();

      expect(service.getLookup).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne', async () => {
      mockService.findOne.mockResolvedValue({ id: 1 });

      await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('deve chamar service.update', async () => {
      const dto: UpdateEvaluationCriterionDto = { peso: 0.5 };
      mockService.update.mockResolvedValue({ id: 1 });

      await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
