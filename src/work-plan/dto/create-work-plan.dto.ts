import { OmitType } from '@nestjs/swagger';
import { WorkPlan } from '../entities/work-plan.entity';

export class WorkPlanCreationDto extends OmitType(WorkPlan, [
  'id',
  'discente',
  'usuario',
  'cronograma',
  'corpo_plano_trabalho',
  'projeto_pesquisa',
] as const) {}
