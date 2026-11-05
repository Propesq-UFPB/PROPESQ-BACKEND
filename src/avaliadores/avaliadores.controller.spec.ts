import { Test, TestingModule } from '@nestjs/testing';
import { AvaliadoresController } from './avaliadores.controller';
import { EditalAvaliadoresController } from './edital-avaliadores.controller';
import { AvaliadoresService } from './avaliadores.service';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findUsuariosElegiveis: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByEdital: jest.fn(),
  setEditalAvaliadores: jest.fn(),
  addToEdital: jest.fn(),
  removeFromEdital: jest.fn(),
};

describe('Avaliador controllers', () => {
  let avaliadoresController: AvaliadoresController;
  let editalController: EditalAvaliadoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvaliadoresController, EditalAvaliadoresController],
      providers: [{ provide: AvaliadoresService, useValue: mockService }],
    }).compile();

    avaliadoresController = module.get(AvaliadoresController);
    editalController = module.get(EditalAvaliadoresController);
  });

  afterEach(() => jest.clearAllMocks());

  it.each([
    [
      AvaliadoresController,
      ['create', 'findAll', 'findUsuariosElegiveis', 'findOne', 'update', 'remove'],
    ],
    [EditalAvaliadoresController, ['findAll', 'set', 'add', 'remove']],
  ] as const)('%p exige papel GESTOR em todas as rotas', (controller, methods) => {
    for (const method of methods) {
      const handler = (controller.prototype as unknown as Record<string, object>)[method];
      expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual(['GESTOR']);
    }
  });

  it('findAll repassa filtros ao service', async () => {
    const query = { limit: 10, offset: 0, ativo: true, search: 'maria', area_principal_id: 3 };
    await avaliadoresController.findAll(query);
    expect(mockService.findAll).toHaveBeenCalledWith(query);
  });

  it('set repassa o conjunto de avaliadores do edital', async () => {
    await editalController.set(1, { avaliador_cadastro_ids: [1, 2] });
    expect(mockService.setEditalAvaliadores).toHaveBeenCalledWith(1, [1, 2]);
  });

  it('remove desvincula o avaliador do edital', async () => {
    await editalController.remove(1, 2);
    expect(mockService.removeFromEdital).toHaveBeenCalledWith(1, 2);
  });
});
