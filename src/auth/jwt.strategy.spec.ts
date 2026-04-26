import { JwtStrategy } from './jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('deve estar definido', () => {
    expect(strategy).toBeDefined();
  });

  it('deve validar e retornar o payload decodificado', async () => {
    const payload = { sub: 1, email: 'teste@email.com', nome: 'Teste' };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 1,
      email: 'teste@email.com',
      nome: 'Teste',
    });
  });
});
