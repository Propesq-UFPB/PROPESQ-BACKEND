import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { DiscentesController } from './discentes.controller';
import { DiscentesService } from './discentes.service';

@Module({
  controllers: [DiscentesController],
  providers: [DiscentesService, RolesGuard],
  exports: [DiscentesService],
})
export class DiscentesModule {}
