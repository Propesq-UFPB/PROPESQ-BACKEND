import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

type JwtPayload = {
  sub: number;
  email: string;
  nome: string;
  funcao?: string;
  unidade_id?: number;
  /** Só em sessões de avaliador externo: link (avaliador_acesso) que abriu a sessão. */
  acesso_id?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      nome: payload.nome,
      funcao: payload.funcao,
      unidade_id: payload.unidade_id,
      ...(payload.acesso_id !== undefined && { acesso_id: payload.acesso_id }),
    };
  }
}
