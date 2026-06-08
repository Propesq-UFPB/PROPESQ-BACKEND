import { Module } from '@nestjs/common';
import { EvaluationCriteriaController } from './evaluation-criteria.controller';
import { EvaluationCriteriaService } from './evaluation-criteria.service';

@Module({
  controllers: [EvaluationCriteriaController],
  providers: [EvaluationCriteriaService],
})
export class EvaluationCriteriaModule {}
