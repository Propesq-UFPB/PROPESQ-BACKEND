import { Module } from '@nestjs/common';
import { ResearchService } from './research.service';
import { ResearchController } from './research.controller';

@Module({
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}
