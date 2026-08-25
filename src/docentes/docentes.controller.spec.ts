import { Test, TestingModule } from '@nestjs/testing';
import { DocentesController } from './docentes.controller';
import { DocentesService } from './docentes.service';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

describe('DocentesController', () => {
  let controller: DocentesController;
  let service: DocentesService;

  const mockDocentesService = {
    findEvaluationAssignments: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocentesController],
      providers: [
        {
          provide: DocentesService,
          useValue: mockDocentesService,
        },
      ],
    }).compile();

    controller = module.get<DocentesController>(DocentesController);
    service = module.get<DocentesService>(DocentesService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findEvaluationAssignments', () => {
    it('deve chamar service.findEvaluationAssignments com id e usuário autenticado', async () => {
      const mockResult = [{ id: 1, projeto_id: 10 }];
      mockDocentesService.findEvaluationAssignments.mockResolvedValue(mockResult);

      const user: CurrentUserPayload = {
        userId: 5,
        email: 'docente@test.com',
        nome: 'Docente',
      };

      const result = await controller.findEvaluationAssignments(1, user);

      expect(service.findEvaluationAssignments).toHaveBeenCalledWith(1, user);
      expect(result).toEqual(mockResult);
    });
  });
});
