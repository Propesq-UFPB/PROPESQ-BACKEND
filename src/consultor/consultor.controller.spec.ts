import { Test, TestingModule } from '@nestjs/testing';
import { ConsultorController } from './consultor.controller';
import { EditalConsultorController } from './edital-consultor.controller';
import { ConsultorService } from './consultor.service';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findUsuariosElegiveis: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByEdital: jest.fn(),
  setEditalConsultores: jest.fn(),
  addToEdital: jest.fn(),
  removeFromEdital: jest.fn(),
};

describe('Consultor controllers', () => {
  let consultorController: ConsultorController;
  let editalController: EditalConsultorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsultorController, EditalConsultorController],
      providers: [{ provide: ConsultorService, useValue: mockService }],
    }).compile();

    consultorController = module.get(ConsultorController);
    editalController = module.get(EditalConsultorController);
  });

  afterEach(() => jest.clearAllMocks());

  it.each([
    [
      ConsultorController,
      ['create', 'findAll', 'findUsuariosElegiveis', 'findOne', 'update', 'remove'],
    ],
    [EditalConsultorController, ['findAll', 'set', 'add', 'remove']],
  ] as const)('%p exige papel GESTOR em todas as rotas', (controller, methods) => {
    for (const method of methods) {
      const handler = (controller.prototype as unknown as Record<string, object>)[method];
      expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual(['GESTOR']);
    }
  });

  it('findAll repassa filtros ao service', async () => {
    await consultorController.findAll(10, 0, true, 'maria');
    expect(mockService.findAll).toHaveBeenCalledWith(10, 0, true, 'maria');
  });

  it('set repassa o conjunto de consultores do edital', async () => {
    await editalController.set(1, { consultor_ids: [1, 2] });
    expect(mockService.setEditalConsultores).toHaveBeenCalledWith(1, [1, 2]);
  });

  it('remove desvincula o consultor do edital', async () => {
    await editalController.remove(1, 2);
    expect(mockService.removeFromEdital).toHaveBeenCalledWith(1, 2);
  });
});
