import { PickType } from '@nestjs/swagger';
import { WorkPlanListQueryDto } from './work-plan-list-query.dto';

export class WorkPlanCreationProjectsQueryDto extends PickType(WorkPlanListQueryDto, ['limit', 'offset'] as const) {}
