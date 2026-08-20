import { Module } from '@nestjs/common';
import { DocentesController } from './docentes.controller';
import { DocentesService } from './docentes.service';

@Module({
  providers: [DocentesService],
  controllers: [DocentesController],
})
export class DocentesModule {}
