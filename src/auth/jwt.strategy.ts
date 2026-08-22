import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { normalizeSystemFuncao } from './normalize-system-funcao';

type JwtPayload = {
  sub: number;
  email: string;
  nome: string;
  funcao?: string;
  unidade_id?: number;
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
      funcao: normalizeSystemFuncao(payload.funcao) ?? payload.funcao,
      unidade_id: payload.unidade_id,
    };
  }
}
