import { Module } from '@nestjs/common';
import { ConsultorController } from './consultor.controller';
import { EditalConsultorController } from './edital-consultor.controller';
import { ConsultorService } from './consultor.service';

@Module({
  controllers: [ConsultorController, EditalConsultorController],
  providers: [ConsultorService],
})
export class ConsultorModule {}
