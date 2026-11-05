import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { AcessoExternoController } from './acesso-externo.controller';
import { AcessoExternoService } from './acesso-externo.service';

@Module({
  // Mesmo segredo do login: as sessões externas são validadas pelo JwtStrategy comum
  imports: [JwtModule.register({ secret: jwtConstants.secret })],
  controllers: [AcessoExternoController],
  providers: [AcessoExternoService],
})
export class AcessoExternoModule {}
