import { Module } from '@nestjs/common';
import { AvaliadoresController } from './avaliadores.controller';
import { EditalAvaliadoresController } from './edital-avaliadores.controller';
import { AvaliadoresService } from './avaliadores.service';
import { AvaliadoresExternosController } from './avaliadores-externos.controller';
import { AvaliadoresExternosService } from './avaliadores-externos.service';

@Module({
  // Externos antes: /avaliadores/externos/... não pode cair em /avaliadores/:id
  controllers: [AvaliadoresExternosController, AvaliadoresController, EditalAvaliadoresController],
  providers: [AvaliadoresService, AvaliadoresExternosService],
})
export class AvaliadoresModule {}
