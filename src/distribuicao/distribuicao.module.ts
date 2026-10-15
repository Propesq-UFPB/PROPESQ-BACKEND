import { Module } from '@nestjs/common';
import { DistribuicaoService } from './distribuicao.service';
import { DistribuicaoController } from './distribuicao.controller';
import { AtribuicaoController } from './atribuicao.controller';

@Module({
  providers: [DistribuicaoService],
  controllers: [DistribuicaoController, AtribuicaoController],
})
export class DistribuicaoModule {}
