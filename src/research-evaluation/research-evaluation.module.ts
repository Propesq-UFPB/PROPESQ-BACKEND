import { Module } from '@nestjs/common';
import { ResearchEvaluationService } from './research-evaluation.service';
import { ResearchEvaluationController } from './research-evaluation.controller';

@Module({
  providers: [ResearchEvaluationService],
  controllers: [ResearchEvaluationController],
})
export class ResearchEvaluationModule {}
