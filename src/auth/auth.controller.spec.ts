import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('deve chamar authService.login', async () => {
      const loginDto: LoginDto = { email: 'test@test.com', password: '123' };
      mockAuthService.login.mockResolvedValue({ access_token: 'token' });

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({ access_token: 'token' });
    });
  });

  describe('register', () => {
    it('deve chamar authService.register', async () => {
      const createUserDto: CreateUserDto = {
        nome: 'User',
        email: 'u@u.com',
        senha: '123',
        funcao_id: 1,
      };

      // Simula retorno sem senha
      const expectedResult = { id: 1, nome: 'User', email: 'u@u.com', funcao_id: 1 };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(createUserDto);

      expect(service.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
