import { Module } from '@nestjs/common';
import { KnowledgeAreaController } from './knowledge-area.controller';
import { KnowledgeAreaService } from './knowledge-area.service';

@Module({
  controllers: [KnowledgeAreaController],
  providers: [KnowledgeAreaService],
})
export class KnowledgeAreaModule {}
