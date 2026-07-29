import { Test, TestingModule } from '@nestjs/testing';
import { WorkPlanController } from './work-plan.controller';
import { WorkPlanService } from './work-plan.service';
import { CreateWorkPlanDto } from './dto/create-work-plan.dto';
import { UpdateWorkPlanDto } from './dto/update-work-plan.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { TipoIndicacao } from '@prisma/client';

const mockWorkPlanService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findIndicacoes: jest.fn(),
  findIndicacaoById: jest.fn(),
  confirmIndicacao: jest.fn(),
  createInteresse: jest.fn(),
  listInteresses: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const currentUser: CurrentUserPayload = {
  userId: 1,
  email: 'admin@test.com',
  nome: 'Admin',
  funcao: 'ADMIN',
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
        pesquisa_id: 1,
        modalidade: 'PIBIC',
        status: 'ATIVO',
        tipo_bolsa: 'REMUNERADA',
        direcionamento_plano: 'Direcionamento',
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

      const result = await controller.create(dto, currentUser);

      expect(service.create).toHaveBeenCalledWith(dto, currentUser);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll com query e usuário', async () => {
      mockWorkPlanService.findAll.mockResolvedValue({ total: 0, results: [] });
      const query = { limit: 10, offset: 0 };

      await controller.findAll(query, currentUser);

      expect(service.findAll).toHaveBeenCalledWith(query, currentUser);
    });
  });

  describe('findIndicacoes', () => {
    it('deve chamar service.findIndicacoes', async () => {
      mockWorkPlanService.findIndicacoes.mockResolvedValue({
        total: 0,
        limit: 10,
        offset: 0,
        results: [],
      });
      const query = { limit: 10, offset: 0 };

      await controller.findIndicacoes(query, currentUser);

      expect(service.findIndicacoes).toHaveBeenCalledWith(query, currentUser);
    });
  });

  describe('findIndicacaoById', () => {
    it('deve chamar service.findIndicacaoById', async () => {
      mockWorkPlanService.findIndicacaoById.mockResolvedValue({ id: 1 });

      await controller.findIndicacaoById(1, currentUser);

      expect(service.findIndicacaoById).toHaveBeenCalledWith(1, currentUser);
    });
  });

  describe('confirmIndicacao', () => {
    it('deve chamar service.confirmIndicacao', async () => {
      const dto = {
        interesse_id: 7,
        tipo_indicacao: TipoIndicacao.BOLSISTA,
        dados_bancarios: { banco: 'BB', agencia: '1', conta: '2' },
      };
      mockWorkPlanService.confirmIndicacao.mockResolvedValue({ id: 1 });

      await controller.confirmIndicacao(1, dto, currentUser);

      expect(service.confirmIndicacao).toHaveBeenCalledWith(1, dto, currentUser);
    });
  });

  describe('createInteresse', () => {
    it('deve chamar service.createInteresse', async () => {
      const dto = { discente_id: 3 };
      mockWorkPlanService.createInteresse.mockResolvedValue({ id: 9 });

      await controller.createInteresse(1, dto, currentUser);

      expect(service.createInteresse).toHaveBeenCalledWith(1, dto, currentUser);
    });
  });

  describe('listInteresses', () => {
    it('deve chamar service.listInteresses', async () => {
      mockWorkPlanService.listInteresses.mockResolvedValue([]);

      await controller.listInteresses(1, currentUser);

      expect(service.listInteresses).toHaveBeenCalledWith(1, currentUser);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne com o id e usuário', async () => {
      mockWorkPlanService.findOne.mockResolvedValue({ id: 1 });

      await controller.findOne(1, currentUser);

      expect(service.findOne).toHaveBeenCalledWith(1, currentUser);
    });
  });

  describe('update', () => {
    it('deve chamar service.update com os parâmetros corretos', async () => {
      const dto: UpdateWorkPlanDto = {
        status: 'EM_REVISAO',
      };

      mockWorkPlanService.update.mockResolvedValue({ id: 1, ...dto });

      await controller.update(1, dto, currentUser);

      expect(service.update).toHaveBeenCalledWith(1, dto, currentUser);
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove com o id correto', async () => {
      mockWorkPlanService.remove.mockResolvedValue({ id: 1 });

      await controller.remove(1, currentUser);

      expect(service.remove).toHaveBeenCalledWith(1, currentUser);
    });
  });
});
