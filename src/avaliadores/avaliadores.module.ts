import { Module } from '@nestjs/common';
import { AvaliadoresController } from './avaliadores.controller';
import { EditalAvaliadoresController } from './edital-avaliadores.controller';
import { AvaliadoresService } from './avaliadores.service';

@Module({
  controllers: [AvaliadoresController, EditalAvaliadoresController],
  providers: [AvaliadoresService],
})
export class AvaliadoresModule {}
