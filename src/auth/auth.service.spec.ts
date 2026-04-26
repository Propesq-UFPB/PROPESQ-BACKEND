import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

// Mock do UsersService
const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

// Mock do JwtService
const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: typeof mockUsersService;
  let jwtService: typeof mockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'teste@teste.com',
      senha: '123',
    };

    const mockUser = {
      id: 1,
      email: 'teste@teste.com',
      senha: '123', // Senha correta
      nome: 'Usuário Teste',
    };

    it('deve retornar um token de acesso se as credenciais forem válidas', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('token_jwt_simulado');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        nome: mockUser.nome,
      });
      expect(result).toEqual({ access_token: 'token_jwt_simulado' });
    });

    it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
      // Simula findByEmail lançando erro (comportamento do UsersService original) ou retornando null
      usersService.findByEmail.mockRejectedValue(new Error('User not found'));
      // Nota: Seu auth.service usa .catch(() => null), então o mock deve refletir que o serviço retorna null ou lança erro capturado

      // Ajuste para simular o comportamento do seu código:
      // O seu código faz: await this.usersService.findByEmail().catch(() => null);
      // Então se o mock rejeitar, o user vira null no código.

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        senha: 'senha_errada',
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('deve registrar um usuário e retornar os dados sem a senha', async () => {
      const createUserDto: CreateUserDto = {
        nome: 'Novo User',
        email: 'novo@email.com',
        senha: '123',
        funcao_id: 1,
      };

      const createdUser = {
        id: 1,
        ...createUserDto,
        criado_em: new Date(),
        atualizado_em: new Date(),
      };

      usersService.create.mockResolvedValue(createdUser);

      const result = await service.register(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).not.toHaveProperty('senha'); // Verifica se a senha foi removida
      expect(result).toHaveProperty('email', createUserDto.email);
    });
  });
});
