import { Module } from '@nestjs/common';
import { AvaliadoresController } from './avaliadores.controller';
import { AvaliadoresService } from './avaliadores.service';

@Module({
  controllers: [AvaliadoresController],
  providers: [AvaliadoresService],
})
export class AvaliadoresModule {}
