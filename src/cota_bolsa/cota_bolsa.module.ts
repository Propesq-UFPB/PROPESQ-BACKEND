import { Module } from '@nestjs/common';
import { CotaBolsaService } from './cota_bolsa.service';
import { CotaBolsaController } from './cota_bolsa.controller';

@Module({
  providers: [CotaBolsaService],
  controllers: [CotaBolsaController],
})
export class CotaBolsaModule {}
