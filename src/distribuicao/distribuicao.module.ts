import { Module } from '@nestjs/common';
import { DistribuicaoService } from './distribuicao.service';
import { DistribuicaoController } from './distribuicao.controller';

@Module({
  providers: [DistribuicaoService],
  controllers: [DistribuicaoController],
})
export class DistribuicaoModule {}
