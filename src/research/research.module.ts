import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';

@Module({
  controllers: [ResearchController],
  providers: [ResearchService, RolesGuard],
})
export class ResearchModule {}
