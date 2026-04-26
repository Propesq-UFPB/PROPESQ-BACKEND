import { Test, TestingModule } from '@nestjs/testing';
import { WorkPlanController } from './work-plan.controller';
import { WorkPlanService } from './work-plan.service';
import { CreateWorkPlanDto } from './dto/create-work-plan.dto';
import { UpdateWorkPlanDto } from './dto/update-work-plan.dto';

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
    it('deve chamar service.create com os parâmetros corretos', async () => {
      const dto: CreateWorkPlanDto = {
        discente_id: 1,
        usuario_id: 1,
        pesquisa_id: 1,
        modalidade: 'PIBIC',
        status: 'ATIVO',
        tipo_bolsa: 'REMUNERADA',
        cronograma_id: 1,
        direcionamento_plano: 'Direcionamento',
        corpo_id: 1,
        corpo_plano_trabalho: {
          titulo: 'Titulo',
          introducao: 'Introducao',
          objetivos: 'Objetivos',
          metodologia: 'Metodologia',
          referencias: 'Referencias',
        },
        atividades: [
          {
            descricao: 'Atividade 1',
            meses: [{ data: '2026-03-01' }],
          },
        ],
      };

      mockWorkPlanService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll com valores padrão', async () => {
      mockWorkPlanService.findAll.mockResolvedValue({ total: 0, results: [] });

      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(10, 0);
    });

    it('deve chamar service.findAll com valores informados', async () => {
      mockWorkPlanService.findAll.mockResolvedValue({ total: 0, results: [] });

      await controller.findAll('20', '5');

      expect(service.findAll).toHaveBeenCalledWith(20, 5);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne com o id numérico', async () => {
      mockWorkPlanService.findOne.mockResolvedValue({ id: 1 });

      await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('deve chamar service.update com os parâmetros corretos', async () => {
      const dto: UpdateWorkPlanDto = {
        status: 'EM_REVISAO',
      };

      mockWorkPlanService.update.mockResolvedValue({ id: 1, ...dto });

      await controller.update('1', dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove com o id correto', async () => {
      mockWorkPlanService.remove.mockResolvedValue({ id: 1 });

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
