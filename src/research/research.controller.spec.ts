import { Test, TestingModule } from '@nestjs/testing';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { updateResearchDto } from './dto/update-research.dto';
import { CategoriaProjeto, TipoProjeto } from '@prisma/client';

const mockResearchService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ResearchController', () => {
  let controller: ResearchController;
  let service: ResearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResearchController],
      providers: [
        {
          provide: ResearchService,
          useValue: mockResearchService,
        },
      ],
    }).compile();

    controller = module.get<ResearchController>(ResearchController);
    service = module.get<ResearchService>(ResearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar service.create com o payload correto', async () => {
      const dto: CreateResearchDto = {
        tipo: TipoProjeto.INTERNO,
        titulo: 'Projeto em PT',
        title: 'Project in EN',
        categoria: CategoriaProjeto.CATEGORIA_PADRAO,
        vigencia: new Date('2026-01-01') as any,
        data_inicio: new Date('2026-01-02') as any,
        data_fim: new Date('2026-12-31') as any,
        email: 'research@example.com',
        palavras_chave_ids: [1],
        pesquisa_objetivo_ids: [10],
        corpo_projeto_id: 5,
        atividade_projeto_pesquisa_ids: [7],
        unidade_id: 3,
      };

      mockResearchService.create.mockResolvedValue({ id: 1 });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('findAll', () => {
    it('deve repassar paginação padrão', async () => {
      mockResearchService.findAll.mockResolvedValue({ total: 0, results: [] });

      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(10, 0);
    });

    it('deve repassar paginação informada', async () => {
      mockResearchService.findAll.mockResolvedValue({ total: 0, results: [] });

      await controller.findAll('20', '5');

      expect(service.findAll).toHaveBeenCalledWith(20, 5);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne com id numérico', async () => {
      mockResearchService.findOne.mockResolvedValue({ id: 1 });

      await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('deve chamar service.update com o dto de atualização', async () => {
      const dto: updateResearchDto = {
        titulo: 'Novo título',
        data_inicio: new Date('2026-02-01') as any,
      };

      mockResearchService.update.mockResolvedValue({ id: 1 });

      await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('delete', () => {
    it('deve chamar service.delete com o id numérico', async () => {
      mockResearchService.delete.mockResolvedValue({ id: 1 });

      await controller.delete(1);

      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
