import { Test, TestingModule } from '@nestjs/testing';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';

// Mock do ResearchService
const mockResearchService = {
  create: jest.fn((dto) => ({ id: 100, ...dto })),
  findAll: jest.fn(() => [{ id: 1, projeto_de_trabalho: 'Teste' }]),
  findOne: jest.fn((id) => ({ id, projeto_de_trabalho: 'Teste Detalhe' })),
  update: jest.fn((id, dto) => ({ id, ...dto })),
  remove: jest.fn((id) => undefined), // Remove geralmente retorna void ou o objeto removido
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

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar service.create com o DTO correto', () => {
      const dto = new CreateResearchDto();
      controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll', () => {
      const result = controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1, projeto_de_trabalho: 'Teste' }]);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne com o ID convertido para número', () => {
      const idString = '1';
      controller.findOne(idString);
      // Nota: O controller recebe string da rota, mas deve passar number pro service (+id)
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('deve chamar service.update com ID e DTO corretos', () => {
      const idString = '1';
      const dto = new UpdateResearchDto();
      controller.update(idString, dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove com o ID correto', () => {
      const idString = '1';
      controller.remove(idString);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
